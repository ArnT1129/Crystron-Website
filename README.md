# Crystron Website

Static Vite site for Crystron Technologies.

## Local Development

```bash
npm install
npm run dev
```

Open the local URL Vite prints in the terminal.

## Production Check

```bash
npm run build
npm run preview
```

## Adding A Blog Post

Create a new Markdown file in `src/content/blog/`.

Use this frontmatter:

```md
---
title: "Post Title"
subtitle: "Post subtitle"
date: "2026-06-11"
displayDate: "June 11, 2026"
category: "Battery Science"
slug: "post-title"
series: "The LFP Complexity Series"
excerpt: "Short excerpt shown on the Blog page."
---

Write the article body here.
```

The Blog page is generated automatically, newest first. The post will be available at `/blog/post-title/`.
