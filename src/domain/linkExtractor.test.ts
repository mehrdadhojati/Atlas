import { describe, it, expect } from "vitest";
import {
  MarkdownLinkExtractor,
  TagExtractor,
  WikiLinkExtractor,
} from "./linkExtractor";

describe("WikiLinkExtractor", () => {
  it("extracts simple wikilinks", () => {
    const extractor = new WikiLinkExtractor();
    const edges = extractor.extract("See [[Foo]] and [[Bar|alias]].", "src");
    expect(edges.map((e) => e.target)).toEqual(["Foo", "Bar"]);
  });

  it("ignores heading fragments", () => {
    const extractor = new WikiLinkExtractor();
    const edges = extractor.extract("[[Note#Section]]", "src");
    expect(edges.map((e) => e.target)).toEqual(["Note"]);
  });
});

describe("TagExtractor", () => {
  it("extracts hashtags but not headers", () => {
    const extractor = new TagExtractor();
    const edges = extractor.extract(
      "# Header\nText with #tag and #other/tag here.",
      "src",
    );
    expect(edges.map((e) => e.target)).toEqual(["#tag", "#other/tag"]);
  });
});

describe("MarkdownLinkExtractor", () => {
  it("extracts markdown links but skips URLs", () => {
    const extractor = new MarkdownLinkExtractor();
    const edges = extractor.extract(
      "[a](Note.md) [b](https://x.com) [c](./Sub.md)",
      "src",
    );
    expect(edges.map((e) => e.target)).toEqual(["Note.md", "./Sub.md"]);
  });
});
