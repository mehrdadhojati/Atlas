import * as vscode from "vscode";

/**
 * Thin adapter over VS Code editor operations, so the domain and application
 * layers stay free of `vscode` imports.
 */
export class VSCodeAdapter {
  /**
   * Opens the note at the given path in an editor group other than the graph's
   * group. Splits the editor first when no other group exists, so the graph
   * always stays visible in its own split.
   */
  public openNote(fsPath: string, graphColumn: vscode.ViewColumn | undefined): void {
    if (!fsPath) return;
    void vscode.window.showTextDocument(vscode.Uri.file(fsPath), {
      viewColumn: this.targetColumn(graphColumn),
      preview: false,
    });
  }

  private targetColumn(graphColumn: vscode.ViewColumn | undefined): vscode.ViewColumn {
    if (graphColumn === undefined) return vscode.ViewColumn.Beside;
    const other = vscode.window.tabGroups.all.find(
      (group) => group.viewColumn !== graphColumn,
    );
    return other ? other.viewColumn : vscode.ViewColumn.Beside;
  }
}
