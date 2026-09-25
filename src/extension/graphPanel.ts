import * as vscode from "vscode";
import { GraphService } from "../application/graphService";
import { VSCodeAdapter } from "../infrastructure/vscodeAdapter";

/**
 * Owns the webview panel lifecycle and the host↔webview message bridge.
 * Reacts to file changes by re-indexing and pushing fresh graph data.
 */
export class GraphPanel {
  private static current: GraphPanel | undefined;
  private static readonly viewType = "atlas";

  private readonly panel: vscode.WebviewPanel;
  private readonly disposables: vscode.Disposable[] = [];
  private readonly nonce: string;

  private constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly service: GraphService,
    private readonly adapter: VSCodeAdapter,
    private readonly version: string,
  ) {
    this.nonce = randomNonce();
    this.panel = vscode.window.createWebviewPanel(
      GraphPanel.viewType,
      "Atlas",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        enableCommandUris: false,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, "dist")],
      },
    );

    this.panel.webview.html = this.getHtml();
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    this.panel.webview.onDidReceiveMessage(
      (message) => this.onMessage(message),
      null,
      this.disposables,
    );

    const watcher = vscode.workspace.createFileSystemWatcher("**/*.md");
    watcher.onDidChange(() => this.scheduleRefresh(), null, this.disposables);
    watcher.onDidCreate(() => this.scheduleRefresh(), null, this.disposables);
    watcher.onDidDelete(() => this.scheduleRefresh(), null, this.disposables);
    this.disposables.push(watcher);
  }

  public static createOrShow(
    extensionUri: vscode.Uri,
    service: GraphService,
    adapter: VSCodeAdapter,
    version: string,
  ): void {
    const column = vscode.window.activeTextEditor
      ? vscode.ViewColumn.Beside
      : vscode.ViewColumn.One;
    if (GraphPanel.current) {
      GraphPanel.current.panel.reveal(column);
      return;
    }
    GraphPanel.current = new GraphPanel(extensionUri, service, adapter, version);
  }

  private getHtml(): string {
    const scriptUri = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "dist", "webview.js"),
    );
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${this.nonce}'; script-src 'nonce-${this.nonce}'; img-src ${this.panel.webview.cspSource} data:;">
  <style nonce="${this.nonce}">
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
    #graph { display: block; width: 100vw; height: 100vh; }
    #version {
      position: fixed;
      top: 8px;
      right: 10px;
      font: 11px sans-serif;
      color: var(--vscode-descriptionForeground);
      opacity: 0.75;
      pointer-events: none;
      user-select: none;
    }
  </style>
</head>
<body>
  <canvas id="graph"></canvas>
  <div id="version">v${this.version}</div>
  <script nonce="${this.nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }

  private onMessage(message: { type: string; path?: string }): void {
    switch (message.type) {
      case "ready":
        void this.refresh();
        break;
      case "openNode":
        if (message.path) this.adapter.openNote(message.path, this.panel.viewColumn);
        break;
    }
  }

  private async refresh(): Promise<void> {
    const data = await this.service.buildGraph();
    await this.panel.webview.postMessage({ type: "graphData", data });
  }

  private scheduleRefresh = debounce(() => void this.refresh(), 500);

  private dispose(): void {
    GraphPanel.current = undefined;
    this.panel.dispose();
    while (this.disposables.length > 0) {
      const disposable = this.disposables.pop();
      disposable?.dispose();
    }
  }
}

function randomNonce(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  wait: number,
): (...args: A) => void {
  let timeout: NodeJS.Timeout | undefined;
  return (...args: A): void => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}
