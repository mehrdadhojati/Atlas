import { build, context } from "esbuild";

const watch = process.argv.includes("--watch");

const shared = { bundle: true, sourcemap: true };

const extensionConfig = {
  ...shared,
  entryPoints: ["src/extension.ts"],
  outfile: "dist/extension.js",
  platform: "node",
  external: ["vscode"],
  format: "cjs",
  target: "node18",
};

const webviewConfig = {
  ...shared,
  entryPoints: ["src/webview/renderer.ts"],
  outfile: "dist/webview.js",
  platform: "browser",
  format: "iife",
  target: "es2020",
};

if (watch) {
  const contexts = await Promise.all([context(extensionConfig), context(webviewConfig)]);
  await Promise.all(contexts.map((c) => c.watch()));
  console.log("esbuild watching\u2026");
} else {
  await Promise.all([build(extensionConfig), build(webviewConfig)]);
  console.log("esbuild build complete");
}
