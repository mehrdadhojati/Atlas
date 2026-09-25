/**
 * A single node in the graph.
 */
export interface GraphNode {
  /** Unique id; for notes this is the workspace-relative path without `.md`. */
  id: string;
  /** Human-readable display name. */
  label: string;
  /** Absolute filesystem path (empty for tags and unresolved notes). */
  path: string;
  /** Visual/semantic category. */
  group: "note" | "tag";
}

/**
 * A directed link between two node ids.
 */
export interface GraphEdge {
  source: string;
  target: string;
}

/**
 * The plain data model shipped to the webview for rendering.
 */
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * A Markdown file read from the workspace.
 */
export interface MarkdownFile {
  /** Workspace-relative id (forward slashes, no extension). */
  id: string;
  /** Display name (basename without extension). */
  label: string;
  /** Absolute filesystem path. */
  path: string;
  /** Raw file contents. */
  content: string;
}
