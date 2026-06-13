---
current_phase: test
next_phase: execute
---

# Test Cases

**Plan:** /spec/blog/plan.md

## Test Strategy
- **Unit tests**: Test build script functions in isolation — frontmatter parsing, markdown rendering, HTML template generation, marker injection, file sorting
- **Integration tests**: Run the full build script and verify output — file existence, HTML structure, content correctness, path resolution
- **E2E tests**: Full build from clean state, verify complete output directory
- **Tooling**: Node.js built-in `node:test` + `node:assert` (no extra dependencies needed; Node 18 support)
- **Exclusions**: No browser/DOM tests for client-side filtering (vanilla JS, tested by manual inspection); no responsive layout tests (CSS-only, no test tooling); no GitHub Action workflow runtime test (YAML syntax validation only)

## Unit Tests

### TC-U01: Parse valid frontmatter with all fields
**Requirement:** FR-01, FR-12
**Given:** A markdown file with frontmatter: `title: "Hello World"`, `date: "2026-01-15"`, `slug: "hello-world"`, `tags: ["javascript", "web"]`, `category: "Engineering"`, `description: "My first post"`
**When:** The parse function processes the file
**Then:** Returns object with `title === "Hello World"`, `date` is a valid Date for 2026-01-15, `slug === "hello-world"`, `tags` is `["javascript", "web"]`, `category === "Engineering"`, `description === "My first post"`, `content` contains the markdown body
**File:** `/test/unit/build.test.mjs`

### TC-U02: Reject post with missing required frontmatter
**Requirement:** FR-01, FR-12
**Given:** A markdown file with frontmatter missing `title` (only has `date` and `slug`)
**When:** The parse function processes the file
**Then:** Throws an error or returns a validation failure indicating `title` is required
**File:** `/test/unit/build.test.mjs`

### TC-U03: Parse frontmatter with missing optional fields
**Requirement:** FR-01, FR-12
**Given:** A markdown file with only required fields: `title: "Minimal Post"`, `date: "2026-03-01"`, `slug: "minimal-post"` — no tags, category, or description
**When:** The parse function processes the file
**Then:** Returns object with `tags` defaulting to `[]`, `category` defaulting to `""` or `undefined`, `description` defaulting to `""` or `undefined`; no error thrown
**File:** `/test/unit/build.test.mjs`

### TC-U04: Render markdown body with standard features
**Requirement:** FR-09
**Given:** Markdown body containing: `## Heading`, `**bold**`, `*italic*`, `[link](https://example.com)`, `- list item`, `> blockquote`, `` `inline code` ``, and a fenced code block with `javascript` language
**When:** The render function processes the markdown
**Then:** Output HTML contains: `<h2>Heading</h2>`, `<strong>bold</strong>`, `<em>italic</em>`, `<a href="https://example.com">link</a>`, `<li>list item</li>`, `<blockquote>`, `<code>inline code</code>`, and `<code class="language-javascript">`
**File:** `/test/unit/build.test.mjs`

### TC-U05: Code blocks include language class for highlight.js
**Requirement:** FR-10
**Given:** Markdown with fenced code block tagged as `python`: ````python\nprint("hello")\n````
**When:** The render function processes the markdown
**Then:** Output HTML contains `<code class="language-python">` wrapping `print("hello")`
**File:** `/test/unit/build.test.mjs`

### TC-U06: Post page template generates valid HTML structure
**Requirement:** FR-02
**Given:** Post data: `{ title: "Test Post", date: "2026-06-01", slug: "test-post", category: "Engineering", tags: ["node"], body: "<p>Hello</p>" }`
**When:** The post template function is called
**Then:** Output contains: `<!DOCTYPE html>`, `<title>Test Post — Hojoong Chung</title>`, `<meta name="description"`, `<link rel="stylesheet" href="../../style.css">`, nav with `<a href="/blog/"` link, `<article>` wrapping `<p>Hello</p>`, footer with copyright, highlight.js CDN `<script>` tag
**File:** `/test/unit/build.test.mjs`

### TC-U07: Posts sorted by date descending
**Requirement:** FR-03
**Given:** Three parsed posts with dates: `2026-01-01`, `2026-06-15`, `2026-03-10`
**When:** The sort function orders the posts
**Then:** Result order is: `2026-06-15`, `2026-03-10`, `2026-01-01`
**File:** `/test/unit/build.test.mjs`

### TC-U08: Marker injection replaces content between markers
**Requirement:** FR-05
**Given:** HTML string containing `<!-- BLOG_LATEST --><!-- /BLOG_LATEST -->` and injection content `<section>Latest</section>`
**When:** The inject function is called
**Then:** Output contains `<!-- BLOG_LATEST --><section>Latest</section><!-- /BLOG_LATEST -->`; content outside markers is unchanged
**File:** `/test/unit/build.test.mjs`

### TC-U09: Marker injection throws when markers missing
**Requirement:** FR-05
**Given:** HTML string with no `<!-- BLOG_LATEST -->` marker
**When:** The inject function is called
**Then:** Throws an error indicating markers not found
**File:** `/test/unit/build.test.mjs`

### TC-U10: Latest posts limited to 3
**Requirement:** FR-05
**Given:** Five parsed posts sorted by date
**When:** The latest posts function selects posts for the landing page
**Then:** Returns exactly 3 posts (the 3 most recent)
**File:** `/test/unit/build.test.mjs`

## Integration Tests

### TC-I01: Full build generates post page at correct path
**Requirement:** FR-02
**Given:** `blog/posts/hello-world.md` exists with valid frontmatter (`slug: "hello-world"`)
**When:** The full build script runs
**Then:** `out/blog/hello-world/index.html` exists and is a non-empty file
**File:** `/test/integration/build-output.test.mjs`

### TC-I02: Full build generates listing page
**Requirement:** FR-03
**Given:** At least one post in `blog/posts/`
**When:** The full build script runs
**Then:** `out/blog/index.html` exists, contains the post title, and contains filter-related data attributes (`data-tags`, `data-category`)
**File:** `/test/integration/build-output.test.mjs`

### TC-I03: Landing page has latest posts injected
**Requirement:** FR-05
**Given:** `v2/index.html` has `<!-- BLOG_LATEST -->` markers and at least one post exists
**When:** The full build script runs
**Then:** `out/index.html` exists, contains post titles between the marker comments, and does not contain empty markers
**File:** `/test/integration/build-output.test.mjs`

### TC-I04: Static files copied correctly
**Requirement:** FR-07
**Given:** `v2/style.css`, `v2/cv.html` exist
**When:** The full build script runs
**Then:** `out/style.css` exists and matches `v2/style.css` content; `out/cv.html` exists; `out/v1/contents/img/` directory exists
**File:** `/test/integration/build-output.test.mjs`

### TC-I05: Nav contains Blog link in all pages
**Requirement:** FR-06
**Given:** Full build completes
**When:** Reading `out/index.html`, `out/blog/index.html`, `out/blog/hello-world/index.html`
**Then:** Each file contains an `<a` tag with href pointing to `/blog/` or the blog listing page with text "Blog"
**File:** `/test/integration/build-output.test.mjs`

### TC-I06: Post page has correct relative path to style.css
**Requirement:** FR-02
**Given:** Full build completes
**When:** Reading `out/blog/hello-world/index.html`
**Then:** Contains `href="../../style.css"` (two levels up from `/blog/hello-world/`)
**File:** `/test/integration/build-output.test.mjs`

### TC-I07: GitHub Action workflow is valid YAML
**Requirement:** FR-08
**Given:** `.github/workflows/` contains a workflow file
**When:** Parsing the YAML file
**Then:** File parses without error, contains `push` trigger on `master`, has `node build.js` or `npm run build` step, uploads from `./out`
**File:** `/test/integration/build-output.test.mjs`

## E2E Tests

### TC-E01: Clean build produces complete output
**Flow:**
1. Delete `out/` directory if it exists
2. Run `npm run build`
3. Verify `out/` directory exists
4. Verify these files exist: `out/index.html`, `out/style.css`, `out/cv.html`, `out/blog/index.html`, `out/blog/hello-world/index.html`
5. Verify `out/v1/contents/img/` directory is non-empty
6. Verify `out/index.html` contains "Latest Posts" or blog post titles
7. Verify `out/blog/index.html` contains post listing content
**Pass criteria:** All files exist, landing page has latest posts, no build errors
**File:** `/test/integration/build-output.test.mjs`

## Coverage Matrix

| Requirement | Test Cases |
|---|---|
| FR-01 (frontmatter parsing) | TC-U01, TC-U02, TC-U03 |
| FR-02 (post page generation) | TC-U06, TC-I01, TC-I06 |
| FR-03 (listing page) | TC-U07, TC-I02 |
| FR-04 (tag/category filtering) | TC-I02 (data attributes) |
| FR-05 (latest posts injection) | TC-U08, TC-U09, TC-U10, TC-I03 |
| FR-06 (nav update) | TC-I05 |
| FR-07 (static file copy) | TC-I04 |
| FR-08 (GitHub Action) | TC-I07 |
| FR-09 (Markdown rendering) | TC-U04 |
| FR-10 (syntax highlighting) | TC-U05 |
| FR-11 (responsive) | — (CSS-only, manual) |
| FR-12 (frontmatter schema) | TC-U01, TC-U02, TC-U03 |

## Known Gaps
- FR-04 (client-side filtering) only tested for data attribute presence; actual filter behavior requires a browser environment
- FR-11 (responsive) is CSS-only and needs manual/visual testing at breakpoints

## Generated Test Files

| File | Test Cases | Runner |
|---|---|---|
| `/test/unit/build.test.mjs` | TC-U01 – TC-U10 | `node --test test/unit/build.test.mjs` |
| `/test/integration/build-output.test.mjs` | TC-I01 – TC-I07, TC-E01 | `node --test test/integration/build-output.test.mjs` |

---
test_status: locked
locked_at: 2026-06-12T12:00:00Z
