import { MarkdownFile } from "../domain/types";

/**
 * Port for reading Markdown files from the workspace.
 * Owned by the application layer; implemented by infrastructure.
 */
export interface FileRepository {
  /** Lists and reads all Markdown files in the current workspace. */
  listMarkdownFiles(): Promise<MarkdownFile[]>;
}
