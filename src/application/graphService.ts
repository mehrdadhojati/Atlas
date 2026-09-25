import { FileRepository } from "./fileRepository";
import { LinkExtractor } from "../domain/linkExtractor";
import { GraphData, GraphNode, MarkdownFile } from "../domain/types";

/**
 * Orchestrates graph construction: reads Markdown files via the repository,
 * extracts links with the registered extractors, resolves targets to nodes,
 * and returns a plain {@link GraphData} model ready for rendering.
 */
export class GraphService {
  public constructor(
    private readonly repository: FileRepository,
    private readonly extractors: LinkExtractor[],
  ) {}

  /** Builds the full graph index from all Markdown files in the workspace. */
  public async buildGraph(): Promise<GraphData> {
    const files = await this.repository.listMarkdownFiles();
    return this.resolveGraph(files);
  }

  private resolveGraph(files: MarkdownFile[]): GraphData {
    const noteById = new Map<string, GraphNode>();
    for (const file of files) {
      noteById.set(file.id, {
        id: file.id,
        label: file.label,
        path: file.path,
        group: "note",
      });
    }

    const idByBasename = new Map<string, string>();
    for (const file of files) {
      const base = basename(file.id).toLowerCase();
      if (!idByBasename.has(base)) {
        idByBasename.set(base, file.id);
      }
    }

    const nodes = new Map<string, GraphNode>();
    const edges: GraphData["edges"] = [];
    const seen = new Set<string>();

    const addNode = (node: GraphNode): void => {
      if (!nodes.has(node.id)) nodes.set(node.id, node);
    };

    for (const file of files) {
      const sourceNode = noteById.get(file.id);
      if (sourceNode) addNode(sourceNode);

      for (const extractor of this.extractors) {
        for (const raw of extractor.extract(file.content, file.id)) {
          const target = this.resolveTarget(raw.target, noteById, idByBasename);
          if (!target) continue;

          addNode(target);
          const key = `${file.id}\u0000${target.id}`;
          if (seen.has(key)) continue;
          seen.add(key);
          edges.push({ source: file.id, target: target.id });
        }
      }
    }

    return { nodes: [...nodes.values()], edges };
  }

  private resolveTarget(
    raw: string,
    noteById: Map<string, GraphNode>,
    idByBasename: Map<string, string>,
  ): GraphNode | undefined {
    if (raw.startsWith("#")) {
      return { id: raw, label: raw, path: "", group: "tag" };
    }

    const normalized = raw.replace(/\.md$/i, "");
    const exact = noteById.get(normalized);
    if (exact) return exact;

    const byBase = idByBasename.get(basename(normalized).toLowerCase());
    if (byBase) return noteById.get(byBase);

    return { id: normalized, label: basename(normalized), path: "", group: "note" };
  }
}

function basename(id: string): string {
  const index = id.lastIndexOf("/");
  return index === -1 ? id : id.slice(index + 1);
}
