import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";

interface GraphNode extends SimulationNodeDatum {
  id: string;
  label: string;
  path: string;
  group: "note" | "tag";
  /** Number of edges incident to this node (computed locally). */
  degree?: number;
  /** Top-level folder this node belongs to (computed locally). */
  cluster?: string;
  /** Resolved color of the node's folder cluster. */
  color?: string;
}

interface GraphLink extends SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphLink[];
}

declare function acquireVsCodeApi(): { postMessage(message: unknown): void };

const vscode = acquireVsCodeApi();

const canvas = document.getElementById("graph") as HTMLCanvasElement;

function getContext(): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  return ctx;
}

const context = getContext();

let simulation: Simulation<GraphNode, GraphLink> | undefined;
let nodes: GraphNode[] = [];
let links: GraphLink[] = [];
let hoveredId: string | undefined;
let focusedId: string | undefined;
let dragNodeId: string | undefined;
let didDrag = false;

let scale = 1;
let offsetX = 0;
let offsetY = 0;
let panning = false;
let panStartX = 0;
let panStartY = 0;
let panStartOffsetX = 0;
let panStartOffsetY = 0;

const MIN_SCALE = 0.2;
const MAX_SCALE = 4;

const NOTE_RADIUS_MIN = 8;
const NOTE_RADIUS_MAX = 18;
const TAG_RADIUS_MIN = 5;
const TAG_RADIUS_MAX = 13;
const LABEL_FONT_SIZE = 12;

const CLUSTER_STRENGTH = 0.3;
const BLOB_PAD = 22;
const BLOB_OPACITY = 0.01;

const FOLDER_PALETTE: Array<[string, string]> = [
  ["--vscode-charts-red", "#e51400"],
  ["--vscode-charts-green", "#388a34"],
  ["--vscode-charts-yellow", "#e2c08d"],
  ["--vscode-charts-blue", "#1c8df0"],
  ["--vscode-charts-purple", "#652d90"],
  ["--vscode-charts-orange", "#d18616"],
];

interface DegreeRange {
  minDegree: number;
  maxDegree: number;
}

let degreeRange: DegreeRange = { minDegree: 0, maxDegree: 0 };

interface Cluster {
  key: string;
  color: string;
  nodes: GraphNode[];
}

let clusters: Cluster[] = [];

function nodeRadius(node: GraphNode): number {
  const min = node.group === "tag" ? TAG_RADIUS_MIN : NOTE_RADIUS_MIN;
  const max = node.group === "tag" ? TAG_RADIUS_MAX : NOTE_RADIUS_MAX;
  const span = degreeRange.maxDegree - degreeRange.minDegree;
  const normalized =
    span <= 0 ? 0 : ((node.degree ?? 0) - degreeRange.minDegree) / span;
  return min + normalized * (max - min);
}

interface Point {
  x: number;
  y: number;
}

function clusterKeyOf(node: GraphNode): string {
  if (node.group === "tag") return "#tags";
  const slash = node.id.indexOf("/");
  return slash === -1 ? "(root)" : node.id.slice(0, slash);
}

function folderColor(index: number): string {
  const [name, fallback] = FOLDER_PALETTE[index % FOLDER_PALETTE.length];
  return cssVar(name, fallback);
}

function forceCluster(alpha: number): void {
  const centroids = new Map<string, { x: number; y: number; count: number }>();
  for (const node of nodes) {
    if (typeof node.x !== "number" || typeof node.y !== "number") continue;
    const key = node.cluster;
    if (key === undefined) continue;
    let centroid = centroids.get(key);
    if (!centroid) {
      centroid = { x: 0, y: 0, count: 0 };
      centroids.set(key, centroid);
    }
    centroid.x += node.x;
    centroid.y += node.y;
    centroid.count += 1;
  }
  for (const centroid of centroids.values()) {
    centroid.x /= centroid.count;
    centroid.y /= centroid.count;
  }
  for (const node of nodes) {
    if (typeof node.x !== "number" || typeof node.y !== "number") continue;
    const key = node.cluster;
    if (key === undefined) continue;
    const centroid = centroids.get(key);
    if (!centroid) continue;
    node.vx = (node.vx ?? 0) + (centroid.x - node.x) * CLUSTER_STRENGTH * alpha;
    node.vy = (node.vy ?? 0) + (centroid.y - node.y) * CLUSTER_STRENGTH * alpha;
  }
}

function convexHull(points: Point[]): Point[] {
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  const cross = (o: Point, a: Point, b: Point): number =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const lower: Point[] = [];
  for (const p of sorted) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
    ) {
      lower.pop();
    }
    lower.push(p);
  }
  const upper: Point[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
    ) {
      upper.pop();
    }
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

function inflate(p: Point, cx: number, cy: number): Point {
  const dx = p.x - cx;
  const dy = p.y - cy;
  const d = Math.hypot(dx, dy) || 1;
  return { x: p.x + (dx / d) * BLOB_PAD, y: p.y + (dy / d) * BLOB_PAD };
}

function drawBlob(points: Point[], color: string): void {
  if (points.length === 0) return;

  context.globalAlpha = BLOB_OPACITY;
  context.fillStyle = color;
  context.beginPath();

  if (points.length === 1) {
    context.arc(points[0].x, points[0].y, BLOB_PAD, 0, Math.PI * 2);
  } else if (points.length === 2) {
    const mx = (points[0].x + points[1].x) / 2;
    const my = (points[0].y + points[1].y) / 2;
    const r =
      Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y) / 2 +
      BLOB_PAD;
    context.arc(mx, my, r, 0, Math.PI * 2);
  } else {
    const hull = convexHull(points);
    let cx = 0;
    let cy = 0;
    for (const p of hull) {
      cx += p.x;
      cy += p.y;
    }
    cx /= hull.length;
    cy /= hull.length;
    const first = inflate(hull[0], cx, cy);
    context.moveTo(first.x, first.y);
    for (const p of hull.slice(1)) {
      const q = inflate(p, cx, cy);
      context.lineTo(q.x, q.y);
    }
    context.closePath();
  }

  context.fill();
  context.globalAlpha = 1;
}

function cssVar(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

const theme = {
  background: () => cssVar("--vscode-editor-background", "#1e1e1e"),
  foreground: () => cssVar("--vscode-editor-foreground", "#cccccc"),
  link: () => cssVar("--vscode-textLink-foreground", "#3794ff"),
  note: () => cssVar("--vscode-charts-blue", "#007acc"),
  tag: () => cssVar("--vscode-charts-orange", "#d18616"),
  accent: () => cssVar("--vscode-charts-purple", "#c586c0"),
};

function resize(): void {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(canvas.clientWidth * ratio);
  canvas.height = Math.floor(canvas.clientHeight * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function toWorldPoint(
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  return {
    x: (x - canvas.clientWidth / 2 - offsetX) / scale,
    y: (y - canvas.clientHeight / 2 - offsetY) / scale,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function zoomAt(clientX: number, clientY: number, factor: number): void {
  const newScale = clamp(scale * factor, MIN_SCALE, MAX_SCALE);
  if (newScale === scale) return;

  const rect = canvas.getBoundingClientRect();
  const px = clientX - rect.left;
  const py = clientY - rect.top;
  const centerX = canvas.clientWidth / 2;
  const centerY = canvas.clientHeight / 2;
  const ratio = newScale / scale;

  offsetX = px - centerX - (px - centerX - offsetX) * ratio;
  offsetY = py - centerY - (py - centerY - offsetY) * ratio;
  scale = newScale;
}

function hitTest(clientX: number, clientY: number): GraphNode | undefined {
  const point = toWorldPoint(clientX, clientY);
  let best: GraphNode | undefined;
  let bestDistance = Infinity;
  for (const node of nodes) {
    if (typeof node.x !== "number" || typeof node.y !== "number") continue;
    const distance = Math.hypot(node.x - point.x, node.y - point.y);
    const threshold = nodeRadius(node) + 4 / scale;
    if (distance < threshold && distance < bestDistance) {
      bestDistance = distance;
      best = node;
    }
  }
  return best;
}

function neighborsOf(id: string): Set<string> {
  const result = new Set<string>([id]);
  for (const link of links) {
    const s = typeof link.source === "object" ? link.source.id : link.source;
    const t = typeof link.target === "object" ? link.target.id : link.target;
    if (s === id) result.add(t);
    if (t === id) result.add(s);
  }
  return result;
}

function startSimulation(data: GraphData): void {
  nodes = data.nodes;
  links = data.edges.map((edge) => ({ ...edge }));

  const degree = new Map<string, number>();
  for (const link of links) {
    const source = typeof link.source === "object" ? link.source.id : link.source;
    const target = typeof link.target === "object" ? link.target.id : link.target;
    degree.set(source, (degree.get(source) ?? 0) + 1);
    degree.set(target, (degree.get(target) ?? 0) + 1);
  }

  let minDegree = Infinity;
  let maxDegree = 0;
  for (const node of nodes) {
    const count = degree.get(node.id) ?? 0;
    node.degree = count;
    if (count < minDegree) minDegree = count;
    if (count > maxDegree) maxDegree = count;
  }
  degreeRange = { minDegree: minDegree === Infinity ? 0 : minDegree, maxDegree };

  const clusterMap = new Map<string, GraphNode[]>();
  for (const node of nodes) {
    const key = clusterKeyOf(node);
    const list = clusterMap.get(key) ?? [];
    list.push(node);
    clusterMap.set(key, list);
  }

  let paletteIndex = 0;
  clusters = [...clusterMap.keys()].sort().map((key) => {
    const clusterNodes = clusterMap.get(key) ?? [];
    const color = key === "#tags" ? theme.tag() : folderColor(paletteIndex++);
    for (const node of clusterNodes) {
      node.cluster = key;
      node.color = color;
    }
    return { key, color, nodes: clusterNodes };
  });

  simulation = forceSimulation(nodes)
    .force(
      "link",
      forceLink<GraphNode, GraphLink>(links)
        .id((d) => d.id)
        .distance(70)
        .strength(0.5),
    )
    .force("charge", forceManyBody().strength(-250))
    .force("cluster", forceCluster)
    .force(
      "collide",
      forceCollide<GraphNode>()
        .radius((d) => nodeRadius(d) + 4)
        .strength(0.8),
    );

  resize();
}

function draw(): void {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const colors = {
    background: theme.background(),
    foreground: theme.foreground(),
    link: theme.link(),
    note: theme.note(),
    tag: theme.tag(),
    accent: theme.accent(),
  };

  context.clearRect(0, 0, width, height);
  context.fillStyle = colors.background;
  context.fillRect(0, 0, width, height);

  context.save();
  context.translate(width / 2 + offsetX, height / 2 + offsetY);
  context.scale(scale, scale);

  for (const cluster of clusters) {
    const points: Point[] = [];
    for (const node of cluster.nodes) {
      if (typeof node.x === "number" && typeof node.y === "number") {
        points.push({ x: node.x, y: node.y });
      }
    }
    drawBlob(points, cluster.color);
  }

  context.strokeStyle = colors.link;
  context.lineWidth = 1 / scale;
  context.globalAlpha = 0.5;
  context.beginPath();
  for (const link of links) {
    const source = typeof link.source === "object" ? link.source : undefined;
    const target = typeof link.target === "object" ? link.target : undefined;
    if (!source || !target) continue;
    if (typeof source.x !== "number" || typeof source.y !== "number") continue;
    if (typeof target.x !== "number" || typeof target.y !== "number") continue;
    context.moveTo(source.x, source.y);
    context.lineTo(target.x, target.y);
  }
  context.stroke();
  context.globalAlpha = 1;

  const activeId = hoveredId ?? focusedId;
  const activeNeighbors = activeId ? neighborsOf(activeId) : new Set<string>();

  for (const node of nodes) {
    if (typeof node.x !== "number" || typeof node.y !== "number") continue;
    const isActive = node.id === activeId;
    const dimmed = activeId !== undefined && !activeNeighbors.has(node.id);
    context.globalAlpha = dimmed ? 0.2 : 1;

    const radius = nodeRadius(node);
    context.fillStyle = isActive
      ? colors.accent
      : node.group === "tag"
        ? colors.tag
        : (node.color ?? colors.note);
    context.beginPath();
    context.arc(node.x, node.y, radius, 0, Math.PI * 2);
    context.fill();

    if (isActive) {
      context.strokeStyle = colors.accent;
      context.lineWidth = 2 / scale;
      context.stroke();
    }

    context.fillStyle = isActive ? colors.accent : colors.foreground;
    context.font = `${LABEL_FONT_SIZE / scale}px sans-serif`;
    context.textAlign = "center";
    context.fillText(node.label, node.x, node.y - radius - 4);
  }

  context.globalAlpha = 1;
  context.restore();
}

function frame(): void {
  draw();
  requestAnimationFrame(frame);
}

canvas.addEventListener("mousedown", (event) => {
  didDrag = false;
  const node = hitTest(event.clientX, event.clientY);
  if (node) {
    dragNodeId = node.id;
    const point = toWorldPoint(event.clientX, event.clientY);
    node.fx = point.x;
    node.fy = point.y;
    canvas.style.cursor = "grabbing";
  } else {
    panning = true;
    panStartX = event.clientX;
    panStartY = event.clientY;
    panStartOffsetX = offsetX;
    panStartOffsetY = offsetY;
    canvas.style.cursor = "grab";
  }
});

window.addEventListener("mousemove", (event) => {
  if (dragNodeId) {
    didDrag = true;
    const node = nodes.find((n) => n.id === dragNodeId);
    if (node) {
      const point = toWorldPoint(event.clientX, event.clientY);
      node.fx = point.x;
      node.fy = point.y;
      simulation?.alphaTarget(0.3).restart();
    }
    return;
  }

  if (panning) {
    didDrag = true;
    offsetX = panStartOffsetX + (event.clientX - panStartX);
    offsetY = panStartOffsetY + (event.clientY - panStartY);
    canvas.style.cursor = "grabbing";
    return;
  }

  const node = hitTest(event.clientX, event.clientY);
  hoveredId = node?.id;
  canvas.style.cursor = node ? "pointer" : "default";
});

window.addEventListener("mouseup", () => {
  if (dragNodeId) {
    const node = nodes.find((n) => n.id === dragNodeId);
    if (node) {
      node.fx = null;
      node.fy = null;
      simulation?.alphaTarget(0).restart();
    }
    dragNodeId = undefined;
  }
  panning = false;
});

canvas.addEventListener("click", (event) => {
  if (didDrag) return;
  const node = hitTest(event.clientX, event.clientY);
  focusedId = node?.id;
});

canvas.addEventListener("dblclick", (event) => {
  const node = hitTest(event.clientX, event.clientY);
  if (node?.path) {
    vscode.postMessage({ type: "openNode", path: node.path });
  }
});

canvas.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
    const factor = Math.pow(1.0015, -event.deltaY);
    zoomAt(event.clientX, event.clientY, factor);
  },
  { passive: false },
);

window.addEventListener("resize", resize);

window.addEventListener("message", (event) => {
  const message = event.data as { type: string; data?: GraphData };
  if (message.type === "graphData" && message.data) {
    startSimulation(message.data);
  }
});

vscode.postMessage({ type: "ready" });
requestAnimationFrame(frame);
