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
    #topbar {
      position: fixed;
      top: 8px;
      right: 10px;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      z-index: 10;
    }
    #search {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }
    .search-field {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border);
      border-radius: 16px;
      padding: 4px 10px;
      opacity: 0.7;
      transition: opacity 0.15s ease, border-color 0.15s ease;
    }
    .search-field:focus-within {
      opacity: 1;
      border-color: var(--vscode-focusBorder);
    }
    .search-icon {
      width: 14px;
      height: 14px;
      color: var(--vscode-input-foreground);
      cursor: pointer;
      flex: 0 0 auto;
    }
    #search-input {
      width: 180px;
      background: transparent;
      border: none;
      outline: none;
      color: var(--vscode-input-foreground);
      font: 12px sans-serif;
    }
    #search-input::placeholder {
      color: var(--vscode-input-placeholderForeground);
    }
    #search-results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin: 4px 0 0;
      padding: 0;
      list-style: none;
      max-height: 300px;
      overflow-y: auto;
      background: var(--vscode-editorWidget-background);
      border: 1px solid var(--vscode-widget-border);
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
      display: none;
    }
    #search-results.visible { display: block; }
    #search-results li {
      padding: 6px 10px;
      cursor: pointer;
      font: 12px sans-serif;
      color: var(--vscode-foreground);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    #search-results li:hover { background: var(--vscode-list-hoverBackground); }
    #search-results li.active {
      background: var(--vscode-list-activeSelectionBackground);
      color: var(--vscode-list-activeSelectionForeground);
    }
    #search-results li.empty {
      cursor: default;
      color: var(--vscode-descriptionForeground);
    }
    #search-results .result-folder {
      color: var(--vscode-descriptionForeground);
      margin-left: 4px;
    }
    #search-results li.active .result-folder { color: inherit; }
    #version {
      font: 11px sans-serif;
      color: var(--vscode-descriptionForeground);
      opacity: 0.75;
      pointer-events: none;
      user-select: none;
      line-height: 24px;
    }
  </style>
</head>
<body>
  <canvas id="graph"></canvas>
  <div id="topbar">
    <div id="search">
      <div class="search-field">
        <svg class="search-icon" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="6.5" cy="6.5" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
          <line x1="10" y1="10" x2="14" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <input id="search-input" type="text" placeholder="Search notes..." autocomplete="off" spellcheck="false" />
      </div>
      <ul id="search-results"></ul>
    </div>
    <div id="version">v${this.version}</div>
  </div>
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
