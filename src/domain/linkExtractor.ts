/**
 * A link extracted from a Markdown document, before target resolution.
 */
export interface RawLink {
  /** The id of the note containing the link. */
  source: string;
  /** The raw link target (e.g., `Foo`, `#tag`, `Note.md`). */
  target: string;
}

/**
 * Extracts links of a specific kind from Markdown text.
 * Implementations are pure: no framework or filesystem access.
 */
export interface LinkExtractor {
  extract(content: string, source: string): RawLink[];
}

/**
 * Extracts Obsidian-style `[[wikilinks]]`, ignoring aliases and heading
 * fragments (e.g., `[[Note|alias]]` and `[[Note#heading]]` → `Note`).
 */
export class WikiLinkExtractor implements LinkExtractor {
  public extract(content: string, source: string): RawLink[] {
    const pattern = /\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]/g;
    const links: RawLink[] = [];
    for (const match of content.matchAll(pattern)) {
      links.push({ source, target: match[1].trim() });
    }
    return links;
  }
}

/**
 * Extracts `#hashtags` (including nested `#a/b` tags), skipping Markdown
 * headers such as `# Heading` (which have a space after the `#`).
 */
export class TagExtractor implements LinkExtractor {
  public extract(content: string, source: string): RawLink[] {
    const pattern = /(?:^|\s)(#[A-Za-z0-9_/-]+)/g;
    const links: RawLink[] = [];
    for (const match of content.matchAll(pattern)) {
      links.push({ source, target: match[1] });
    }
    return links;
  }
}

/**
 * Extracts Markdown links `[label](target)`, skipping images, URLs, and
 * same-document anchors.
 */
export class MarkdownLinkExtractor implements LinkExtractor {
  public extract(content: string, source: string): RawLink[] {
    const pattern = /\[[^\]]*\]\(([^)\s]+)\)/g;
    const links: RawLink[] = [];
    for (const match of content.matchAll(pattern)) {
      const target = match[1];
      if (
        target.startsWith("http") ||
        target.startsWith("#") ||
        target.startsWith("mailto:")
      ) {
        continue;
      }
      links.push({ source, target });
    }
    return links;
  }
}
