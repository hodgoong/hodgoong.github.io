---
current_phase: complete
next_phase: test
spec_file: /spec/blog/feature-spec.md
execution_status: complete
validation_status: passed
test_pass_rate: 100%
---

# Development Plan

**Spec:** `/spec/blog/feature-spec.md` | **Approach:** Output Directory Build — Node.js script (marked + gray-matter) generates static HTML to `out/`, GitHub Action deploys

## Phase Overview
| Phase | Name | Parallel? | Depends On |
|---|---|---|---|
| 1 | Project Setup & Build Foundation | No | — |
| 2 | Blog Post Pages | No | Phase 1 |
| 3 | Blog Listing Page | No | Phase 2 |
| 4 | Landing Page Integration | No | Phase 2 |
| 5 | Build Pipeline & Deployment | No | Phase 3, 4 |

---

## Phase 1: Project Setup & Build Foundation
### Tasks
- [x] T1.1: Create `package.json` at project root with `marked` and `gray-matter` as dependencies; remove stale `package-lock.json`
- [x] T1.2: Create `blog/posts/` directory and write a sample post (`hello-world.md`) with full frontmatter (title, date, slug, tags, category, description) and body exercising all Markdown features (headings, code blocks, lists, images, links, blockquotes)
- [x] T1.3: Create `build.js` skeleton — reads `blog/posts/*.md`, parses each with gray-matter, sorts by date descending, logs parsed post metadata to verify pipeline works
- [x] T1.4: Run `npm install` to generate a clean `package-lock.json`

### Acceptance Criteria
- `node build.js` runs without error and prints parsed post metadata (title, date, slug, tags, category)
- `blog/posts/hello-world.md` exists with valid frontmatter
- `package.json` lists `marked` and `gray-matter` as dependencies

---

## Phase 2: Blog Post Pages
### Tasks
- [x] T2.1: In `build.js`, create an HTML template function for individual post pages — reuses exact nav structure from `v2/index.html` (with Blog link added), loads shared `style.css` via relative path, includes page-specific blog styles in `<style>` block, includes footer, loads highlight.js from CDN
- [x] T2.2: In `build.js`, render each post's Markdown body to HTML via `marked` (with language-class injection for code blocks), wrap in the post template, write to `out/blog/<slug>/index.html`
- [x] T2.3: Write blog post CSS styles (inline in template): article typography (headings, paragraphs, lists, blockquotes, code), content max-width, responsive layout, using Trusted Organised design tokens
- [x] T2.4: Verify generated post page renders correctly — proper HTML structure, correct relative paths to style.css, nav links work, code blocks have language classes

### Acceptance Criteria
- `node build.js` generates `out/blog/hello-world/index.html`
- Generated HTML has valid structure: doctype, head with meta/fonts/style.css, nav with Blog link, article content, footer
- Markdown features render correctly: headings, code blocks with language classes, lists, links, images, blockquotes
- Page uses only design system tokens (no raw hex/px values in blog-specific styles)

---

## Phase 3: Blog Listing Page
### Tasks
- [x] T3.1: In `build.js`, create an HTML template function for the blog listing page — same nav/footer as post pages, displays all posts as cards sorted by date (newest first), each card shows: title, date, category tag, tags list, description, and links to the post
- [x] T3.2: Write listing page CSS styles (inline in template): card grid layout, tag/category pills, filter controls, responsive breakpoints matching existing site
- [x] T3.3: Add client-side vanilla JS for tag/category filtering — clickable tag pills and category buttons that show/hide posts without page reload, "All" button to reset
- [x] T3.4: Write to `out/blog/index.html` and verify listing page renders all posts with working filter controls

### Acceptance Criteria
- `node build.js` generates `out/blog/index.html`
- Listing page shows all posts sorted newest-first with title, date, category, tags, description
- Clicking a tag or category filters the displayed posts; "All" resets the view
- Layout is responsive at 1024px, 768px, 640px breakpoints
- Each post card links to `/blog/<slug>/`

---

## Phase 4: Landing Page Integration
### Tasks
- [x] T4.1: Modify `v2/index.html` — add "Blog" link to nav (between "About" and "Contact"), add `<!-- BLOG_LATEST --><!-- /BLOG_LATEST -->` marker pair before the achievement spotlight section
- [x] T4.2: In `build.js`, add logic to copy `v2/index.html` to `out/index.html` and inject latest 3 posts HTML between the marker comments — each post rendered as a card matching the site's design language (title, date, category tag, description, link)
- [x] T4.3: Write CSS for the latest posts section (inline in injected HTML or appended to style): section header ("Latest Posts"), card layout (3-column grid → 1-column on mobile), consistent with existing section patterns
- [x] T4.4: Verify landing page in `out/` shows latest 3 posts section with correct content and links

### Acceptance Criteria
- `v2/index.html` source has Blog nav link and marker comments
- `out/index.html` contains latest 3 posts section between markers with correct titles, dates, descriptions
- Latest posts section follows existing section pattern (section__label, section__title, grid layout)
- Blog nav link points to `/blog/`
- Posts link to `/blog/<slug>/`

---

## Phase 5: Build Pipeline & Deployment
### Tasks
- [x] T5.1: In `build.js`, add static file copy logic — copy `v2/style.css`, `v2/cv.html` to `out/`, copy `v1/contents/img/` to `out/v1/contents/img/` preserving structure; ensure relative image paths from v2 pages still resolve
- [x] T5.2: Replace `.github/workflows/nextjs.yml` with a new workflow: trigger on push to master, checkout → setup Node 18 → npm ci → node build.js → configure-pages → upload-pages-artifact (path: `./out`) → deploy-pages
- [x] T5.3: Add `build` script to `package.json` (`"build": "node build.js"`)
- [x] T5.4: Full end-to-end test — run `npm run build`, verify `out/` contains: `index.html` (with latest posts), `style.css`, `cv.html`, `blog/index.html`, `blog/hello-world/index.html`, `v1/contents/img/` directory, all links and image paths resolve correctly

### Acceptance Criteria
- `npm run build` produces complete `out/` directory with all site files
- All relative paths (images, style.css, nav links) resolve correctly from any page
- GitHub Action workflow is valid YAML with correct job steps
- `out/` directory structure matches expected deployment layout
- Clean build from scratch (no `out/` pre-existing) succeeds

---

## Sequencing Rationale
Phase 1 establishes the build toolchain and sample content — everything depends on this. Phase 2 builds the core unit (individual post pages) which Phase 3 (listing) and Phase 4 (landing page) both reference. Phases 3 and 4 could theoretically run in parallel since they both consume the same post data, but Phase 4 modifies the source `index.html` which Phase 5 needs to copy, so keeping them sequential avoids conflicts. Phase 5 ties everything together with file copying and the deployment pipeline.

---
## Summary for Next Phase
**Functional requirements to test:** FR-01 (frontmatter parsing), FR-02 (post page generation), FR-03 (listing page generation), FR-04 (tag/category filtering), FR-05 (latest posts injection), FR-06 (nav update), FR-07 (static file copy), FR-08 (GitHub Action workflow), FR-09 (Markdown rendering), FR-10 (syntax highlighting), FR-11 (responsive), FR-12 (frontmatter schema). **Acceptance criteria per phase** are defined above. **Test strategy hints:** Unit test the build script functions (frontmatter parsing, template generation, marker injection, file copy); integration test the full build output (file existence, HTML structure validation, link integrity); validate GitHub Action workflow syntax.
