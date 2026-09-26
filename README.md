# Atlas

Render an Obsidian-style, force-directed graph of the Markdown notes in your
workspace. It parses `[[wikilinks]]`, `#tags`, and Markdown links into nodes and
edges, draws them in a webview, and lets you drag nodes to rearrange their
neighborhood and double-click through to open notes.

<img src="https://api.iengineer.me/images/ea57fa70cf3e404db7bcf70ee52cbde9.png" alt="Atlas graph" width="800" />

## Features

- Live force-directed graph of all `.md` files in the workspace
- Parses `[[wikilinks]]`, `#tags`, and standard Markdown links
- Drag nodes to rearrange; links stay visible
- Hover a node to highlight it and its neighbors in purple
- Click a node to keep it focused until you click elsewhere
- Double-click a node to open that note in a new tab
- Wheel to zoom, drag the background to pan
- Node size scales with the number of connections
- Auto-refreshes when Markdown files change
- Follows the VS Code theme
- Search documents with highlight functionality

## Installation
- Until it's published on the VS Code Marketplace, you can build and install it manually via the Extensions tab.

## Usage

1. Open a workspace folder containing Markdown files.
2. Run the command **Atlas: Show Graph** from the Command Palette. (Ctrl+Shift+P)
3. Might need to restart VS Code after installation

## Build --> .vsix

-- npm run build
-- npm run package
