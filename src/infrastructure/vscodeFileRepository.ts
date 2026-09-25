import * as path from "path";
import * as vscode from "vscode";
import { FileRepository } from "../application/fileRepository";
import { MarkdownFile } from "../domain/types";

/**
 * Reads Markdown files from the active VS Code workspace.
 * The only place filesystem access touches VS Code APIs.
 */
export class VSCodeFileRepository implements FileRepository {
  public async listMarkdownFiles(): Promise<MarkdownFile[]> {
    const uris = await vscode.workspace.findFiles("**/*.md", "**/node_modules/**");
    const files: MarkdownFile[] = [];
    for (const uri of uris) {
      const content = Buffer.from(await vscode.workspace.fs.readFile(uri)).toString(
        "utf8",
      );
      files.push(this.toMarkdownFile(uri, content));
    }
    return files;
  }

  private toMarkdownFile(uri: vscode.Uri, content: string): MarkdownFile {
    const folder = vscode.workspace.getWorkspaceFolder(uri);
    const relative = folder
      ? path.relative(folder.uri.fsPath, uri.fsPath).split(path.sep).join("/")
      : uri.fsPath;
    return {
      id: relative.replace(/\.md$/i, ""),
      label: path.basename(uri.fsPath, ".md"),
      path: uri.fsPath,
      content,
    };
  }
}
