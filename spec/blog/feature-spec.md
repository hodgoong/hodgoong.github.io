# Feature Spec: Blog

**Date:** 2026-06-12 | **Status:** Draft

## Overview
Add a Markdown-powered blog to the portfolio site. A Node.js build script converts posts into styled static HTML pages deployed via GitHub Actions. The landing page surfaces the latest 3 posts.

## Goals / Non-Goals
**Goals:**
- Author writes Markdown → commit → styled blog post appears at `/blog/<slug>/`
- Blog listing at `/blog/` with tag and category filtering
- Latest 3 posts section on the landing page (build-time injected)
- Consistent with Trusted Organised design system
- Zero-framework: vanilla HTML/CSS/JS output

**Non-Goals:**
- Comments, RSS, search, reading time, TOC
- CMS or admin UI
- Analytics or newsletter integration
- Framework migration (no Next.js, no Eleventy)

## User Stories
- As the site author, I want to write blog posts in Markdown with frontmatter so that I can publish content without writing HTML
- As the site author, I want posts to build automatically on git push so that publishing requires only a commit
- As a visitor, I want to browse all posts and filter by tag or category so that I can find relevant content
- As a visitor, I want to see the latest posts on the landing page so that I know the site is active
- As a visitor, I want blog pages to look consistent with the rest of the portfolio so that the experience feels cohesive

## Functional Requirements
- **FR-01**: Build script reads `.md` files from `blog/posts/`, parses frontmatter (title, date, slug, tags, category, description) and body via `gray-matter` + `marked`
- **FR-02**: Build script generates individual post pages at `out/blog/<slug>/index.html` using a consistent HTML template (shared nav, footer, style.css, page-specific blog styles)
- **FR-03**: Build script generates a blog listing page at `out/blog/index.html` showing all posts sorted by date (newest first), with title, date, category, tags, and description
- **FR-04**: Blog listing page supports client-side tag and category filtering via vanilla JS (show/hide, no page reload)
- **FR-05**: Build script copies `v2/index.html` to `out/index.html` and injects latest 3 posts HTML at a `<!-- BLOG_LATEST -->` marker comment
- **FR-06**: Navigation bar updated with a "Blog" link pointing to `/blog/`
- **FR-07**: Build script copies all static assets (v2/, v1/contents/img/) to `out/` preserving directory structure
- **FR-08**: GitHub Action workflow replaces current `nextjs.yml`: checkout → npm ci → node build.js → upload-pages-artifact from `out/` → deploy-pages
- **FR-09**: Blog post pages render standard Markdown: headings (h1–h6), paragraphs, bold/italic, links, images, ordered/unordered lists, blockquotes, inline code, fenced code blocks
- **FR-10**: Fenced code blocks have syntax highlighting via highlight.js (CDN-loaded, language-class injection by `marked`)
- **FR-11**: All blog pages are responsive, matching existing breakpoints (1024px, 768px, 640px)
- **FR-12**: Frontmatter schema: `title` (string, required), `date` (YYYY-MM-DD, required), `slug` (string, required), `tags` (string[], optional), `category` (string, optional), `description` (string, optional)

## Technical Design
**Approach:** Output Directory Build (Option A from research)

**File Structure (new):**
```
blog/
  posts/           ← Markdown source files
    hello-world.md
    ...
build.js           ← Node.js build script
package.json       ← marked, gray-matter dependencies
out/               ← Generated output (gitignored)
  index.html       ← Landing page (with latest posts injected)
  style.css
  cv.html
  blog/
    index.html     ← Blog listing page
    <slug>/
      index.html   ← Individual post page
  v1/contents/img/ ← Copied static assets
```

**Changes to Existing Code:**
- `v2/index.html`: Add `<!-- BLOG_LATEST -->` marker before the achievement spotlight section; add "Blog" link to nav
- `.github/workflows/nextjs.yml`: Replace entirely with a blog-build workflow
- `.gitignore`: Confirm `/out/` is excluded (already is)
- Root `package-lock.json`: Remove stale lock file, create fresh `package.json`

**New Components:**
- `build.js` — Main build script (~200 lines)
- `package.json` — Project manifest with `marked` and `gray-matter`
- `blog/posts/*.md` — Sample blog post(s)
- Generated HTML templates (embedded in build.js as template functions)

## Affected Areas
| File/Area | Change Type |
|---|---|
| `v2/index.html` | Modify: add nav link + latest posts marker |
| `.github/workflows/nextjs.yml` | Replace: new build workflow |
| `build.js` | New: build script |
| `package.json` | New: project dependencies |
| `blog/posts/` | New: markdown source directory |

## Risks & Mitigations
| Risk | Mitigation |
|---|---|
| Marker injection fragile if index.html restructured | Use unique comment `<!-- BLOG_LATEST -->` + `<!-- /BLOG_LATEST -->` pair; build script validates marker exists before injection |
| Relative path breakage when copying to out/ | Build script resolves all paths relative to out/ root; test with actual image references |
| Code highlighting adds page weight | CDN-loaded highlight.js with minimal language set; lazy-load only on pages with code blocks |
| Stale package-lock.json from unrelated project | Delete existing lock file; create clean package.json from scratch |

---
current_phase: plan
next_phase: test
