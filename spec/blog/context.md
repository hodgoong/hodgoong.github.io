---
phase: clarify
project_type: brownfield
feature_name: blog
status: complete
current_phase: clarify
next_phase: research
---

# SDD Context

## Project Type
Brownfield — adding a blog feature to an existing static HTML/CSS/JS portfolio site (v2).

## Problem Statement
The portfolio site at hodgoong.github.io lacks a content publishing mechanism. The site owner wants to write blog posts in Markdown, store them in the GitHub repo, and have them automatically built into styled HTML pages on commit via GitHub Actions. The landing page should surface the latest 3 posts to drive engagement.

## Success Criteria
1. Author writes a `.md` file with frontmatter (title, date, tags, category), commits it, and GitHub Action produces a styled HTML page at `/blog/<slug>/`
2. A blog listing page at `/blog/` shows all posts with tag/category filtering
3. The landing page (v2/index.html) displays a "Latest Posts" section with the 3 most recent posts
4. Blog pages match the existing "Trusted Organised" design system (DM Sans/Mono, brand tokens)
5. Posts render standard Markdown features: headings, code blocks, images, links, lists

## Scope
### In Scope
- Markdown-to-HTML build script (Node.js, using marked + gray-matter)
- Blog listing page at `/blog/` with tag and category filtering
- Individual post pages at `/blog/<slug>/`
- Frontmatter schema: title, date, tags, category, description, slug
- "Latest Posts" section on the landing page (3 most recent)
- GitHub Action workflow to build blog on push to master
- Responsive design matching existing site
- Navigation update (add "Blog" link to nav)

### Out of Scope
- Comments system
- RSS feed
- Full-text search
- Reading time estimates / table of contents
- CMS or admin interface
- Analytics integration
- Newsletter/subscription

## Users & Context
- **Author**: Hojoong Chung — writes Markdown files in the repo, commits to trigger build
- **Visitors**: Portfolio viewers who may also read blog content
- **Scale**: Low volume — personal blog, likely a few posts per month

## Technical Constraints & Preferences
- **Build tool**: Simple Node.js build script (no framework migration). Uses `marked` for Markdown parsing and `gray-matter` for frontmatter extraction.
- **No framework**: The site remains static HTML/CSS/JS — no React, Next.js, or Eleventy
- **Design system**: Must use existing "Trusted Organised" CSS tokens (variables in v2/style.css)
- **Deployment**: GitHub Pages via GitHub Actions on push to master
- **Existing workflow**: Current `.github/workflows/nextjs.yml` references Next.js but no Next.js project exists — needs to be replaced/updated for the blog build
- **URL structure**: `/blog/` for listing, `/blog/<slug>/` for individual posts
- **Source files**: Markdown posts stored in a `/blog/posts/` directory (or similar) in the repo

## Dependencies
- npm packages: `marked`, `gray-matter`
- GitHub Actions for automated build
- GitHub Pages for hosting

## Known Risks & Unknowns
- The existing GitHub Action workflow references Next.js — needs careful replacement to avoid breaking the current site deployment
- Image handling in blog posts: need to decide where blog images are stored (likely `/blog/images/` or within post directories)
- Code syntax highlighting: `marked` doesn't include it by default — may need a plugin or CSS-only solution
- The current site has no package.json — one will need to be created or the existing one needs blog build dependencies

## Open Questions
- None — all clarified during intake

---
## Summary for Next Phase
The portfolio site needs a blog feature built with a lightweight Node.js build script (marked + gray-matter) that converts Markdown files with frontmatter into styled HTML pages matching the Trusted Organised design system. Key deliverables: blog listing page with tag/category filtering at `/blog/`, individual post pages at `/blog/<slug>/`, a "Latest Posts" section on the landing page, and a GitHub Action that builds on push to master. The site must remain static HTML/CSS/JS with no framework dependencies.
