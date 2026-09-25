import * as vscode from "vscode";
import { GraphService } from "./application/graphService";
import {
  MarkdownLinkExtractor,
  TagExtractor,
  WikiLinkExtractor,
} from "./domain/linkExtractor";
import { GraphPanel } from "./extension/graphPanel";
import { VSCodeFileRepository } from "./infrastructure/vscodeFileRepository";
import { VSCodeAdapter } from "./infrastructure/vscodeAdapter";

/**
 * Composition root: wires the domain, application, and infrastructure layers
 * together and registers the entry-point command.
 */
export function activate(context: vscode.ExtensionContext): void {
  const repository = new VSCodeFileRepository();
  const adapter = new VSCodeAdapter();
  const extractors = [
    new WikiLinkExtractor(),
    new TagExtractor(),
    new MarkdownLinkExtractor(),
  ];
  const service = new GraphService(repository, extractors);
  const version = context.extension.packageJSON.version as string;

  const showGraph = vscode.commands.registerCommand("atlas.showGraph", () => {
    if (!vscode.workspace.workspaceFolders?.length) {
      void vscode.window.showInformationMessage(
        "Atlas: open a workspace folder first.",
      );
      return;
    }
    GraphPanel.createOrShow(context.extensionUri, service, adapter, version);
  });

  context.subscriptions.push(showGraph);
}

export function deactivate(): void {}
