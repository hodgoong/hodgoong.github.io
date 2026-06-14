import { readFileSync, readdirSync, mkdirSync, writeFileSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- Marked configuration: language class injection on code blocks ---
marked.use({
  renderer: {
    code({ text, lang }) {
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
      if (lang) {
        return `<pre><code class="language-${lang}">${escaped}</code></pre>\n`;
      }
      return `<pre><code>${escaped}</code></pre>\n`;
    },
  },
});

// --- Exported functions ---

/**
 * Parse frontmatter from a raw markdown string.
 * Returns { title, date, slug, tags, category, description, content }.
 * Throws if required fields (title, date, slug) are missing.
 */
export function parseFrontmatter(mdString) {
  const { data, content } = matter(mdString);

  // Validate required fields
  const required = ['title', 'date', 'slug'];
  for (const field of required) {
    if (!data[field]) {
      throw new Error(`Missing required frontmatter field: ${field}`);
    }
  }

  return {
    title: data.title,
    date: data.date,
    slug: data.slug,
    tags: data.tags || [],
    category: data.category,
    description: data.description,
    content: content,
  };
}

/**
 * Render markdown string to HTML via marked, with language class injection.
 */
export function renderMarkdown(mdString) {
  return marked(mdString);
}

/**
 * Generate a full HTML page for a blog post.
 */
export function postTemplate(post, bodyHtml) {
  const dateObj = new Date(post.date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const categoryHtml = post.category
    ? `<span class="blog-post__category">${post.category}</span>`
    : '';

  const tagsHtml = post.tags && post.tags.length
    ? `<div class="blog-post__tags">${post.tags.map((t) => `<span class="blog-post__tag">${t}</span>`).join('')}</div>`
    : '';

  const descriptionMeta = post.description
    ? `\n  <meta name="description" content="${post.description}">`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title} — Hojoong Chung</title>${descriptionMeta}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'none'; object-src 'none'; frame-src 'none';">
  <link rel="stylesheet" href="../../style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
  <style>
    .blog-post {
      max-width: var(--content-max, 720px);
      margin: 0 auto;
      padding: var(--space-16) var(--space-6);
    }

    .blog-post__header {
      margin-bottom: var(--space-10);
    }

    .blog-post__meta {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-4);
    }

    .blog-post__category {
      display: inline-block;
      padding: var(--space-1) var(--space-3);
      font-size: var(--text-xs);
      font-weight: var(--font-semibold);
      letter-spacing: var(--tracking-wider);
      text-transform: uppercase;
      color: var(--brand-700);
      background: var(--brand-50);
      border-radius: var(--radius-full);
    }

    .blog-post__date {
      font-size: var(--text-sm);
      color: var(--neutral-500);
    }

    .blog-post__title {
      font-size: var(--text-3xl);
      font-weight: var(--font-bold);
      letter-spacing: var(--tracking-tight);
      color: var(--neutral-900);
      line-height: var(--leading-tight);
      margin: 0 0 var(--space-4);
    }

    .blog-post__tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .blog-post__tag {
      display: inline-block;
      padding: var(--space-1) var(--space-2);
      font-size: var(--text-xs);
      font-family: var(--font-mono);
      color: var(--neutral-600);
      background: var(--neutral-100);
      border-radius: var(--radius-md);
    }

    /* Article typography */
    .blog-post__body h1 {
      font-size: var(--text-3xl);
      font-weight: var(--font-bold);
      letter-spacing: var(--tracking-tight);
      color: var(--neutral-900);
      margin: var(--space-10) 0 var(--space-4);
    }

    .blog-post__body h2 {
      font-size: var(--text-2xl);
      font-weight: var(--font-semibold);
      letter-spacing: var(--tracking-tight);
      color: var(--neutral-900);
      margin: var(--space-10) 0 var(--space-4);
    }

    .blog-post__body h3 {
      font-size: var(--text-xl);
      font-weight: var(--font-semibold);
      color: var(--neutral-900);
      margin: var(--space-8) 0 var(--space-3);
    }

    .blog-post__body p {
      font-size: var(--text-base);
      line-height: var(--leading-relaxed);
      color: var(--neutral-700);
      margin: 0 0 var(--space-5);
    }

    .blog-post__body a {
      color: var(--brand-600);
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    .blog-post__body a:hover {
      color: var(--brand-700);
    }

    /* Lists */
    .blog-post__body ul,
    .blog-post__body ol {
      margin: 0 0 var(--space-5);
      padding-left: var(--space-6);
      color: var(--neutral-700);
      line-height: var(--leading-relaxed);
    }

    .blog-post__body li {
      margin-bottom: var(--space-2);
    }

    /* Blockquotes */
    .blog-post__body blockquote {
      margin: var(--space-6) 0;
      padding: var(--space-4) var(--space-5);
      border-left: 3px solid var(--brand-300);
      font-style: italic;
      color: var(--neutral-500);
      background: var(--neutral-50);
      border-radius: 0 var(--radius-md) var(--radius-md) 0;
    }

    .blog-post__body blockquote p {
      margin: 0;
      color: inherit;
    }

    /* Inline code */
    .blog-post__body code {
      font-family: var(--font-mono);
      font-size: 0.875em;
      padding: var(--space-1) var(--space-2);
      background: var(--neutral-100);
      border-radius: var(--radius-sm);
      color: var(--neutral-800);
    }

    /* Code blocks */
    .blog-post__body pre {
      margin: 0 0 var(--space-5);
      padding: var(--space-5);
      background: var(--neutral-50);
      border-radius: var(--radius-lg);
      overflow-x: auto;
    }

    .blog-post__body pre code {
      padding: 0;
      background: none;
      border-radius: 0;
      font-size: var(--text-sm);
      line-height: var(--leading-relaxed);
    }

    /* Images */
    .blog-post__body img {
      max-width: 100%;
      height: auto;
      border-radius: var(--radius-lg);
      margin: var(--space-6) 0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .blog-post {
        padding: var(--space-12) var(--space-5);
      }

      .blog-post__title {
        font-size: var(--text-2xl);
      }
    }

    @media (max-width: 640px) {
      .blog-post {
        padding: var(--space-10) var(--space-4);
      }

      .blog-post__title {
        font-size: var(--text-xl);
      }

      .blog-post__body h2 {
        font-size: var(--text-xl);
      }

      .blog-post__body h3 {
        font-size: var(--text-lg);
      }
    }
  </style>
</head>
<body>

  <!-- Nav -->
  <nav class="nav" role="navigation" aria-label="Main navigation">
    <a href="/" class="nav__brand" aria-label="Hojoong Chung home">HC</a>
    <ul class="nav__links" role="list">
      <li><a href="/#work"    class="nav__link">Work</a></li>
      <li><a href="/#about"   class="nav__link">About</a></li>
      <li><a href="/blog/"    class="nav__link">Blog</a></li>
    </ul>
    <div class="nav__actions">
      <a href="https://github.com/hodgoong" target="_blank" rel="noopener noreferrer" class="nav__icon" aria-label="GitHub profile">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="18" height="18">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
        </svg>
      </a>
    </div>
  </nav>

  <main class="blog-post">
    <header class="blog-post__header">
      <div class="blog-post__meta">
        ${categoryHtml}
        <time class="blog-post__date" datetime="${post.date}">${formattedDate}</time>
      </div>
      <h1 class="blog-post__title">${post.title}</h1>
      ${tagsHtml}
    </header>

    <article class="blog-post__body">
      ${bodyHtml}
    </article>
  </main>

  <!-- Footer -->
  <footer id="contact" class="footer" role="contentinfo">
    <div class="footer__inner">
      <p class="footer__copy">Designed &amp; coded by Hojoong Chung. All rights reserved 2019–2026.</p>
      <nav class="footer__links" aria-label="Footer links">
        <a href="https://github.com/hodgoong" target="_blank" rel="noopener noreferrer" class="footer__link">GitHub</a>
        <a href="https://hojoongchung.wordpress.com" target="_blank" rel="noopener noreferrer" class="footer__link">Blog</a>
        <a href="#" data-m="hodgoong" data-d="gmail.com" class="footer__link">Email</a>
      </nav>
    </div>
  </footer>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <script>hljs.highlightAll();</script>
  <script>document.querySelectorAll('[data-m]').forEach(function(a){var e=a.dataset.m+'@'+a.dataset.d;a.href='mailto:'+e;if(a.dataset.showText)a.textContent=e;});</script>
</body>
</html>`;
}

/**
 * Generate a full HTML page for the blog listing.
 */
export function listingTemplate(posts) {
  // Collect unique categories and tags
  const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))];
  const tags = [...new Set(posts.flatMap((p) => p.tags || []))];

  const categoryBtns = categories
    .map((c) => `<button class="blog-filter__btn" data-filter-category="${c}">${c}</button>`)
    .join('');

  const tagBtns = tags
    .map((t) => `<button class="blog-filter__btn blog-filter__btn--tag" data-filter-tag="${t}">${t}</button>`)
    .join('');

  const cardsHtml = posts
    .map((post) => {
      const dateObj = new Date(post.date);
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const categoryPill = post.category
        ? `<span class="blog-card__category">${post.category}</span>`
        : '';

      const tagsHtml =
        post.tags && post.tags.length
          ? `<div class="blog-card__tags">${post.tags.map((t) => `<span class="blog-card__tag">${t}</span>`).join('')}</div>`
          : '';

      const descHtml = post.description
        ? `<p class="blog-card__desc">${post.description}</p>`
        : '';

      return `<article class="blog-card" data-category="${post.category || ''}" data-tags='${JSON.stringify(post.tags || [])}'>
          <div class="blog-card__meta">
            <time class="blog-card__date" datetime="${post.date}">${formattedDate}</time>
            ${categoryPill}
          </div>
          <h2 class="blog-card__title"><a href="/blog/${post.slug}/">${post.title}</a></h2>
          ${tagsHtml}
          ${descHtml}
        </article>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog — Hojoong Chung</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'none'; object-src 'none'; frame-src 'none';">
  <link rel="stylesheet" href="../style.css">
  <style>
    .blog-listing {
      max-width: var(--container-max);
      margin: 0 auto;
      padding: calc(var(--nav-height) + var(--space-16)) var(--space-6) var(--space-16);
    }

    .blog-listing__header {
      margin-bottom: var(--space-12);
    }

    .blog-listing__header .section__label {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      font-weight: var(--weight-medium);
      color: var(--primary);
      letter-spacing: var(--tracking-wider);
      text-transform: uppercase;
      margin-bottom: var(--space-2);
    }

    .blog-listing__header .section__title {
      font-size: var(--text-3xl);
      font-weight: var(--weight-bold);
      letter-spacing: var(--tracking-tight);
      line-height: var(--leading-tight);
      color: var(--text);
    }

    .blog-filter {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-8);
    }

    .blog-filter__btn {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      font-weight: var(--weight-medium);
      letter-spacing: var(--tracking-wide);
      color: var(--text-muted);
      background: none;
      border: 1px solid var(--border);
      border-radius: var(--radius-full);
      padding: var(--space-1) var(--space-3);
      cursor: pointer;
      transition: color var(--duration-fast) var(--ease-out),
                  border-color var(--duration-fast) var(--ease-out),
                  background-color var(--duration-fast) var(--ease-out);
    }

    .blog-filter__btn:hover {
      color: var(--text);
      border-color: var(--border-strong);
    }

    .blog-filter__btn.is-active {
      color: var(--primary);
      border-color: var(--primary);
      background-color: var(--primary-muted);
    }

    .blog-card-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-4);
    }

    .blog-card {
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-5) var(--space-6);
      background-color: var(--surface-raised);
      transition: box-shadow var(--duration-fast) var(--ease-out),
                  border-color var(--duration-fast) var(--ease-out);
    }

    .blog-card:hover {
      box-shadow: var(--shadow-md);
      border-color: var(--border-strong);
    }

    .blog-card__meta {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-3);
    }

    .blog-card__date {
      font-size: var(--text-sm);
      color: var(--text-muted);
    }

    .blog-card__category {
      display: inline-block;
      padding: var(--space-1) var(--space-3);
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      letter-spacing: var(--tracking-wider);
      text-transform: uppercase;
      color: var(--brand-700);
      background: var(--brand-50);
      border-radius: var(--radius-full);
    }

    .blog-card__title {
      font-size: var(--text-xl);
      font-weight: var(--weight-semibold);
      letter-spacing: var(--tracking-tight);
      line-height: var(--leading-snug);
      margin-bottom: var(--space-3);
    }

    .blog-card__title a {
      color: var(--text);
      text-decoration: none;
      transition: color var(--duration-fast) var(--ease-out);
    }

    .blog-card__title a:hover {
      color: var(--primary);
    }

    .blog-card__tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin-bottom: var(--space-3);
    }

    .blog-card__tag {
      display: inline-block;
      padding: var(--space-1) var(--space-2);
      font-size: var(--text-xs);
      font-family: var(--font-mono);
      color: var(--neutral-600);
      background: var(--neutral-100);
      border-radius: var(--radius-md);
    }

    .blog-card__desc {
      font-size: var(--text-base);
      color: var(--text-muted);
      line-height: var(--leading-relaxed);
    }

    .hidden {
      display: none;
    }

    @media (max-width: 768px) {
      .blog-listing {
        padding: calc(var(--nav-height) + var(--space-12)) var(--space-5) var(--space-12);
      }

      .blog-listing__header .section__title {
        font-size: var(--text-2xl);
      }

      .blog-card__title {
        font-size: var(--text-lg);
      }
    }

    @media (max-width: 640px) {
      .blog-listing {
        padding: calc(var(--nav-height) + var(--space-10)) var(--space-4) var(--space-10);
      }

      .blog-listing__header .section__title {
        font-size: var(--text-xl);
      }

      .blog-card {
        padding: var(--space-4);
      }
    }
  </style>
</head>
<body>

  <!-- Nav -->
  <nav class="nav" role="navigation" aria-label="Main navigation">
    <a href="/" class="nav__brand" aria-label="Hojoong Chung home">HC</a>
    <ul class="nav__links" role="list">
      <li><a href="/#work"    class="nav__link">Work</a></li>
      <li><a href="/#about"   class="nav__link">About</a></li>
      <li><a href="/blog/"    class="nav__link">Blog</a></li>
    </ul>
    <div class="nav__actions">
      <a href="https://github.com/hodgoong" target="_blank" rel="noopener noreferrer" class="nav__icon" aria-label="GitHub profile">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="18" height="18">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
        </svg>
      </a>
    </div>
  </nav>

  <main class="blog-listing">
    <header class="blog-listing__header">
      <p class="section__label">Writing</p>
      <h1 class="section__title">Blog</h1>
    </header>

    <div class="blog-filter" role="group" aria-label="Filter posts">
      <button class="blog-filter__btn is-active" data-filter-all>All</button>
      ${categoryBtns}
      ${tagBtns}
    </div>

    <div class="blog-card-grid">
      ${cardsHtml}
    </div>
  </main>

  <!-- Footer -->
  <footer id="contact" class="footer" role="contentinfo">
    <div class="footer__inner">
      <p class="footer__copy">Designed &amp; coded by Hojoong Chung. All rights reserved 2019–2026.</p>
      <nav class="footer__links" aria-label="Footer links">
        <a href="https://github.com/hodgoong" target="_blank" rel="noopener noreferrer" class="footer__link">GitHub</a>
        <a href="https://hojoongchung.wordpress.com" target="_blank" rel="noopener noreferrer" class="footer__link">Blog</a>
        <a href="#" data-m="hodgoong" data-d="gmail.com" class="footer__link">Email</a>
      </nav>
    </div>
  </footer>

  <script>
  (function () {
    var allBtn = document.querySelector('[data-filter-all]');
    var filterBtns = document.querySelectorAll('.blog-filter__btn');
    var cards = document.querySelectorAll('.blog-card');

    function clearActive() {
      filterBtns.forEach(function (b) { b.classList.remove('is-active'); });
    }

    function showAll() {
      cards.forEach(function (c) { c.classList.remove('hidden'); });
      clearActive();
      allBtn.classList.add('is-active');
    }

    allBtn.addEventListener('click', showAll);

    filterBtns.forEach(function (btn) {
      if (btn.hasAttribute('data-filter-all')) return;

      btn.addEventListener('click', function () {
        clearActive();
        btn.classList.add('is-active');

        var cat = btn.getAttribute('data-filter-category');
        var tag = btn.getAttribute('data-filter-tag');

        cards.forEach(function (card) {
          if (cat) {
            card.classList.toggle('hidden', card.getAttribute('data-category') !== cat);
          } else if (tag) {
            var cardTags = JSON.parse(card.getAttribute('data-tags') || '[]');
            card.classList.toggle('hidden', cardTags.indexOf(tag) === -1);
          }
        });
      });
    });
  })();
  </script>
  <script>document.querySelectorAll('[data-m]').forEach(function(a){var e=a.dataset.m+'@'+a.dataset.d;a.href='mailto:'+e;if(a.dataset.showText)a.textContent=e;});</script>

</body>
</html>`;
}

/**
 * Sort posts by date descending (newest first). Returns a new array.
 */
export function sortPosts(posts) {
  return [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Inject HTML content between <!-- BLOG_LATEST --> and <!-- /BLOG_LATEST --> markers.
 * Throws if markers are not found.
 */
export function injectLatestPosts(html, content) {
  const pattern = /<!-- BLOG_LATEST -->[\s\S]*?<!-- \/BLOG_LATEST -->/;
  if (!pattern.test(html)) {
    throw new Error('BLOG_LATEST marker comments not found in HTML');
  }
  return html.replace(pattern, `<!-- BLOG_LATEST -->${content}<!-- /BLOG_LATEST -->`);
}

/**
 * Return the first 3 posts from a sorted array.
 */
export function getLatestPosts(posts) {
  return posts.slice(0, 3);
}

/**
 * Generate HTML for the "Latest Posts" section injected into the landing page.
 * CSS is inlined as a <style> tag at the start of the returned string.
 */
export function latestPostsHtml(posts) {
  const css = `<style>
.latest-posts {
  padding: var(--section-padding) 0;
  border-bottom: 1px solid var(--border);
}
.latest-posts__inner {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--space-6);
}
.latest-posts__header {
  margin-bottom: var(--space-12);
}
.latest-posts__label {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--primary);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  margin-bottom: var(--space-2);
}
.latest-posts__title {
  font-size: var(--text-3xl);
  font-weight: var(--weight-bold);
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
  color: var(--text);
}
.latest-posts__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
  margin-bottom: var(--space-10);
}
@media (max-width: 640px) {
  .latest-posts__grid {
    grid-template-columns: 1fr;
  }
}
.latest-posts__card {
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  background-color: var(--surface-raised);
  transition: box-shadow var(--duration-fast) var(--ease-out);
}
.latest-posts__card:hover {
  box-shadow: var(--shadow-md);
}
.latest-posts__card-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}
.latest-posts__card-date {
  font-size: var(--text-xs);
  color: var(--text-muted);
  font-family: var(--font-mono);
}
.latest-posts__card-category {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--primary);
  background-color: var(--primary-muted);
  border: 1px solid var(--primary-border);
  border-radius: var(--radius-full);
  padding: var(--space-0_5) var(--space-2);
  letter-spacing: var(--tracking-wide);
}
.latest-posts__card-title {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-snug);
  margin-bottom: var(--space-2);
}
.latest-posts__card-title a {
  color: var(--text);
  text-decoration: none;
}
.latest-posts__card-title a:hover {
  text-decoration: underline;
}
.latest-posts__card-desc {
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: var(--leading-relaxed);
}
.latest-posts__footer {
  text-align: center;
}
.latest-posts__view-all {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--primary);
  text-decoration: none;
  border: 1px solid var(--primary-border);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-5);
  display: inline-block;
  transition: background-color var(--duration-fast) var(--ease-out),
              color var(--duration-fast) var(--ease-out);
}
.latest-posts__view-all:hover {
  background-color: var(--primary-muted);
  color: var(--primary-hover);
}
</style>`;

  const cards = posts.map((post) => {
    const date = new Date(post.date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
    const category = post.category || '';
    const desc = post.description || '';
    return `<article class="latest-posts__card">
  <div class="latest-posts__card-meta">
    <span class="latest-posts__card-date">${date}</span>${category ? `
    <span class="latest-posts__card-category">${category}</span>` : ''}
  </div>
  <h3 class="latest-posts__card-title"><a href="/blog/${post.slug}/">${post.title}</a></h3>
  <p class="latest-posts__card-desc">${desc}</p>
</article>`;
  }).join('\n');

  return `${css}
<section class="latest-posts">
  <div class="latest-posts__inner">
    <header class="latest-posts__header">
      <p class="latest-posts__label">From the blog</p>
      <h2 class="latest-posts__title">Latest Posts</h2>
    </header>
    <div class="latest-posts__grid">
${cards}
    </div>
    <div class="latest-posts__footer">
      <a href="/blog/" class="latest-posts__view-all">View all posts</a>
    </div>
  </div>
</section>`;
}

// --- Main build logic ---

function main() {
  const postsDir = join(__dirname, 'blog', 'posts');
  const outDir = join(__dirname, 'out');
  const files = readdirSync(postsDir).filter((f) => f.endsWith('.md'));

  const posts = files.map((file) => {
    const raw = readFileSync(join(postsDir, file), 'utf-8');
    return parseFrontmatter(raw);
  });

  const sorted = sortPosts(posts);

  // Generate individual post pages
  for (const post of sorted) {
    const bodyHtml = renderMarkdown(post.content);
    const pageHtml = postTemplate(post, bodyHtml);
    const postDir = join(outDir, 'blog', post.slug);
    mkdirSync(postDir, { recursive: true });
    writeFileSync(join(postDir, 'index.html'), pageHtml, 'utf-8');
    console.log(`  wrote: out/blog/${post.slug}/index.html`);
  }

  // Generate blog listing page
  const blogDir = join(outDir, 'blog');
  mkdirSync(blogDir, { recursive: true });
  const listingHtml = listingTemplate(sorted);
  writeFileSync(join(blogDir, 'index.html'), listingHtml, 'utf-8');
  console.log(`  wrote: out/blog/index.html`);

  // Generate landing page with latest posts injected
  const indexSrc = readFileSync(join(__dirname, 'v2', 'index.html'), 'utf-8');
  const latestPosts = getLatestPosts(sorted);
  const injectedHtml = latestPostsHtml(latestPosts);
  const indexOut = injectLatestPosts(indexSrc, injectedHtml);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), indexOut, 'utf-8');
  console.log(`  wrote: out/index.html`);

  // --- T5.1: Copy static assets ---
  cpSync(join(__dirname, 'v2', 'style.css'), join(outDir, 'style.css'));
  console.log('  copied: v2/style.css → out/style.css');

  cpSync(join(__dirname, 'v2', 'cv.html'), join(outDir, 'cv.html'));
  console.log('  copied: v2/cv.html → out/cv.html');

  const imgSrc = join(__dirname, 'v1', 'contents', 'img');
  const imgDest = join(outDir, 'v1', 'contents', 'img');
  mkdirSync(join(outDir, 'v1', 'contents'), { recursive: true });
  cpSync(imgSrc, imgDest, { recursive: true });
  console.log('  copied: v1/contents/img/ → out/v1/contents/img/');

  cpSync(join(__dirname, 'CNAME'), join(outDir, 'CNAME'));
  console.log('  copied: CNAME → out/CNAME');

  console.log(`\nTotal: ${sorted.length} post(s) generated`);
}

main();
