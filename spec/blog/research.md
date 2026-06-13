---
current_phase: research
next_phase: plan
---

# SDD Research

## Context Summary
Brownfield feature: add a blog to an existing static HTML/CSS/JS portfolio site (v2). Markdown posts with frontmatter are the source, built to HTML via a Node.js script (marked + gray-matter). Blog listing at `/blog/` with tag/category filtering, individual posts at `/blog/<slug>/`, and a "Latest Posts" section on the landing page (3 most recent). Must match the Trusted Organised design system. Deployed via GitHub Actions to GitHub Pages.

## Codebase Analysis (Brownfield)

### Current Architecture
- **v2/**: 3 static files — `index.html`, `cv.html`, `style.css`. No build step. No JavaScript framework.
- **Navigation pattern**: Shared nav bar with links to sections (#work, #about, #contact) and cv.html. Blog link will be added here.
- **Page pattern** (cv.html): Same `<head>` boilerplate (fonts, style.css), same nav component, page-specific styles in an inline `<style>` block, same footer.
- **Design system**: All styling uses CSS custom properties from Trusted Organised tokens (--brand-*, --neutral-*, --text-*, --space-*, etc.)
- **Images**: Portfolio images stored in `v1/contents/img/` and referenced from v2 via relative paths (`../v1/contents/img/`).
- **GitHub Action**: `.github/workflows/nextjs.yml` — uses `upload-pages-artifact` → `deploy-pages`. References Next.js build commands but no Next.js project actually exists. This workflow needs replacement.
- **package.json**: Missing at root. The `package-lock.json` references an unrelated React/MUI project. Needs a clean package.json for blog build dependencies.
- **gitignore**: Lists `package-lock.json`, `/out/`, `/build/`, `node_modules/` — already set up for a build output directory pattern.

### Patterns to Follow
- Reuse exact nav HTML structure from index.html/cv.html
- Use inline `<style>` blocks for page-specific styles (cv.html pattern)
- Reference shared style.css via relative path
- Use design system tokens for all visual values

## Solution Approaches

### Option A: Output Directory Build (Build-to-`out/`)
**Description:** A single Node.js build script reads markdown posts, generates all blog HTML files, copies all existing v2/ static files, and patches the landing page `index.html` with the latest 3 posts — all into an `out/` directory. GitHub Action runs `npm run build` and deploys `out/` to Pages. Generated files are never committed to the repo.

**How it works:**
1. Build script reads `blog/posts/*.md`, parses frontmatter + body
2. Generates `out/blog/index.html` (listing page) and `out/blog/<slug>/index.html` (each post)
3. Copies `v2/index.html` into `out/`, injects "Latest Posts" HTML at a `<!-- BLOG_LATEST -->` marker
4. Copies remaining v2/ files, v1/contents/img/ to `out/`
5. GitHub Action: checkout → install → build → upload `out/` → deploy

**Pros:**
- Clean separation of source files and build output
- Latest posts are fully static HTML — no client-side JS needed, SEO-friendly
- `.gitignore` already excludes `/out/`
- Aligns with the existing `upload-pages-artifact` deployment pattern
- Single source of truth: markdown files are the only content to maintain

**Cons:**
- Every deploy requires copying all static files through the build
- Local development requires running the build script to preview blog (or viewing markdown directly)
- Index.html needs a marker comment to indicate where to inject latest posts

**Effort:** Medium

### Option B: In-Place Generation + Client-Side Latest Posts
**Description:** Build script generates blog HTML files directly into `v2/blog/`. A `posts.json` manifest is also generated. The landing page includes a small inline script that fetches `posts.json` and renders the latest 3 post cards at runtime.

**How it works:**
1. Build script reads `blog/posts/*.md`, generates `v2/blog/index.html` and `v2/blog/<slug>/index.html`
2. Also writes `v2/blog/posts.json` with metadata for all posts
3. Landing page has a `<script>` that fetches `/blog/posts.json` and injects cards into a container
4. Generated files are committed to the repo by the GitHub Action

**Pros:**
- Simpler build script — only generates blog files, doesn't touch rest of site
- Can preview the existing v2/ site without running a build
- Familiar pattern if images/files are referenced relatively

**Cons:**
- Generated HTML files are committed to the repo (source and output mixed)
- Latest posts require JavaScript — not visible without JS, worse for SEO
- Git history becomes noisy with auto-generated commits
- Two sources of truth for blog content (markdown + generated HTML)

**Effort:** Low-Medium

### Option C: Jekyll (GitHub Pages Native)
**Description:** Restructure the site to use Jekyll, GitHub Pages' built-in static site generator. Markdown files are automatically processed without a custom build script.

**How it works:**
1. Add `_config.yml`, convert existing pages to Jekyll layouts
2. Blog posts go in `_posts/` with standard Jekyll naming convention
3. Liquid templates handle listing page and latest posts
4. GitHub Pages builds automatically — no custom Action needed

**Pros:**
- Zero custom build infrastructure
- Battle-tested blog tooling (pagination, tags, etc.)
- GitHub Pages handles everything natively

**Cons:**
- Requires restructuring the entire site into Jekyll's layout/template system
- Ruby-based — different toolchain from the user's Node.js preference
- Learning curve for Liquid template syntax
- Contradicts the "simple Node.js script" preference from clarify
- Would need to convert existing hand-crafted HTML to Jekyll templates

**Effort:** High

## Recommendation

**Recommended:** Option A — Output Directory Build

**Reasoning:**
Option A provides the cleanest architecture: source markdown stays separate from generated output, the landing page gets fully static latest posts (good for SEO), and the deployment pattern aligns with what's already configured (artifact upload → deploy). The `.gitignore` already excludes `/out/`, so the build output stays out of version control. The build script is slightly more complex than Option B but avoids the main drawbacks: no generated files in git, no client-side JS dependency for latest posts, and no source/output mixing.

Option B is viable but committing generated files creates maintenance friction. Option C contradicts the explicit technical preference for a Node.js solution.

**Key risks:**
- Index.html marker-based injection is fragile if the HTML structure changes significantly — mitigate by using a clear, unique marker comment
- Build script must correctly resolve relative paths for images when copying to `out/`
- Code syntax highlighting needs a solution — recommend `highlight.js` loaded via CDN with a build-time class injection from `marked`

## Open Questions
None — all key decisions made.

---
## Summary for Next Phase
Use a Node.js build script (marked + gray-matter) that reads markdown from `blog/posts/`, generates HTML to `out/`, copies static files from v2/, and injects latest 3 posts into the landing page at a marker comment. Blog listing page supports client-side tag/category filtering via vanilla JS. Individual post pages follow the cv.html pattern (shared nav/footer/style.css + inline page-specific styles). GitHub Action replaces the current Next.js workflow: checkout → npm ci → node build.js → upload `out/` → deploy-pages. Code syntax highlighting via highlight.js CDN. All output in `out/` (already gitignored).
