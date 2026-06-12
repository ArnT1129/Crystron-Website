import { marked } from "marked";

const modules = import.meta.glob("./blog/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
});

function parseValue(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed.slice(1, -1);
    }
  }
  return trimmed;
}

function parsePost(raw, filePath) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(`Blog post is missing frontmatter: ${filePath}`);
  }

  const [, frontmatter, markdown] = match;
  const meta = {};
  frontmatter.split("\n").forEach((line) => {
    const index = line.indexOf(":");
    if (index === -1) return;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1);
    meta[key] = parseValue(value);
  });

  return {
    ...meta,
    html: marked.parse(normalizeMarkdown(markdown)),
    markdown: normalizeMarkdown(markdown),
  };
}

function normalizeMarkdown(markdown) {
  return markdown.replace(/^\s{8}/gm, "").trim();
}

export const blogPosts = Object.entries(modules)
  .map(([filePath, raw]) => parsePost(raw, filePath))
  .sort((a, b) => new Date(b.date) - new Date(a.date));

export function getBlogPost(slug) {
  return blogPosts.find((post) => post.slug === slug);
}
