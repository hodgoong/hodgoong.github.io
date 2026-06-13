import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..', '..');

// Build script exports are loaded dynamically after the module exists
let parseFrontmatter, renderMarkdown, postTemplate, sortPosts, injectLatestPosts, getLatestPosts;

before(async () => {
  const build = await import(join(ROOT, 'build.js'));
  parseFrontmatter = build.parseFrontmatter;
  renderMarkdown = build.renderMarkdown;
  postTemplate = build.postTemplate;
  sortPosts = build.sortPosts;
  injectLatestPosts = build.injectLatestPosts;
  getLatestPosts = build.getLatestPosts;
});

// --- TC-U01: Parse valid frontmatter with all fields ---
describe('parseFrontmatter', () => {
  it('TC-U01: parses all frontmatter fields from a valid post', () => {
    const md = `---
title: "Hello World"
date: "2026-01-15"
slug: "hello-world"
tags: ["javascript", "web"]
category: "Engineering"
description: "My first post"
---

# Welcome

This is the body.`;

    const result = parseFrontmatter(md);
    assert.equal(result.title, 'Hello World');
    assert.equal(result.slug, 'hello-world');
    assert.deepEqual(result.tags, ['javascript', 'web']);
    assert.equal(result.category, 'Engineering');
    assert.equal(result.description, 'My first post');
    assert.ok(result.content.includes('# Welcome'));
    // Date should be parseable to 2026-01-15
    const d = new Date(result.date);
    assert.equal(d.getFullYear(), 2026);
  });

  // --- TC-U02: Reject post with missing required frontmatter ---
  it('TC-U02: throws when required field "title" is missing', () => {
    const md = `---
date: "2026-01-15"
slug: "no-title"
---

Body text.`;

    assert.throws(() => parseFrontmatter(md), /title/i);
  });

  // --- TC-U03: Parse frontmatter with missing optional fields ---
  it('TC-U03: defaults optional fields when absent', () => {
    const md = `---
title: "Minimal Post"
date: "2026-03-01"
slug: "minimal-post"
---

Body.`;

    const result = parseFrontmatter(md);
    assert.equal(result.title, 'Minimal Post');
    assert.ok(Array.isArray(result.tags));
    assert.equal(result.tags.length, 0);
  });
});

// --- TC-U04: Render markdown body with standard features ---
describe('renderMarkdown', () => {
  it('TC-U04: renders headings, bold, italic, links, lists, blockquotes, code', () => {
    const md = [
      '## Heading',
      '**bold** and *italic*',
      '[link](https://example.com)',
      '- list item',
      '> blockquote',
      '`inline code`',
      '```javascript',
      'const x = 1;',
      '```',
    ].join('\n');

    const html = renderMarkdown(md);
    assert.ok(html.includes('<h2>'), 'missing h2');
    assert.ok(html.includes('<strong>bold</strong>'), 'missing bold');
    assert.ok(html.includes('<em>italic</em>'), 'missing italic');
    assert.ok(html.includes('href="https://example.com"'), 'missing link');
    assert.ok(html.includes('<li>'), 'missing list item');
    assert.ok(html.includes('<blockquote>'), 'missing blockquote');
    assert.ok(html.includes('inline code'), 'missing inline code');
    assert.ok(html.includes('language-javascript'), 'missing language class');
  });

  // --- TC-U05: Code blocks include language class ---
  it('TC-U05: adds language-python class to python code block', () => {
    const md = '```python\nprint("hello")\n```';
    const html = renderMarkdown(md);
    assert.ok(html.includes('language-python'), 'missing language-python class');
    assert.ok(html.includes('print'), 'missing code content');
  });
});

// --- TC-U06: Post page template generates valid HTML ---
describe('postTemplate', () => {
  it('TC-U06: generates complete HTML with nav, article, footer', () => {
    const post = {
      title: 'Test Post',
      date: '2026-06-01',
      slug: 'test-post',
      category: 'Engineering',
      tags: ['node'],
      description: 'A test',
    };
    const bodyHtml = '<p>Hello</p>';
    const html = postTemplate(post, bodyHtml);

    assert.ok(html.includes('<!DOCTYPE html>'), 'missing doctype');
    assert.ok(html.includes('<title>Test Post'), 'missing title');
    assert.ok(html.includes('style.css'), 'missing style.css ref');
    assert.ok(html.includes('/blog/'), 'missing blog nav link');
    assert.ok(html.includes('<article'), 'missing article tag');
    assert.ok(html.includes('<p>Hello</p>'), 'missing body');
    assert.ok(html.includes('<footer'), 'missing footer');
    assert.ok(html.includes('highlight'), 'missing highlight.js ref');
  });
});

// --- TC-U07: Posts sorted by date descending ---
describe('sortPosts', () => {
  it('TC-U07: sorts posts newest first', () => {
    const posts = [
      { title: 'Old', date: '2026-01-01' },
      { title: 'New', date: '2026-06-15' },
      { title: 'Mid', date: '2026-03-10' },
    ];
    const sorted = sortPosts(posts);
    assert.equal(sorted[0].title, 'New');
    assert.equal(sorted[1].title, 'Mid');
    assert.equal(sorted[2].title, 'Old');
  });
});

// --- TC-U08: Marker injection replaces content ---
describe('injectLatestPosts', () => {
  it('TC-U08: injects content between markers', () => {
    const html = '<div>before</div><!-- BLOG_LATEST --><!-- /BLOG_LATEST --><div>after</div>';
    const content = '<section>Latest</section>';
    const result = injectLatestPosts(html, content);
    assert.ok(result.includes('<!-- BLOG_LATEST --><section>Latest</section><!-- /BLOG_LATEST -->'));
    assert.ok(result.includes('<div>before</div>'));
    assert.ok(result.includes('<div>after</div>'));
  });

  // --- TC-U09: Throws when markers missing ---
  it('TC-U09: throws when markers are not found', () => {
    const html = '<div>no markers here</div>';
    assert.throws(() => injectLatestPosts(html, '<section>X</section>'), /marker/i);
  });
});

// --- TC-U10: Latest posts limited to 3 ---
describe('getLatestPosts', () => {
  it('TC-U10: returns at most 3 posts', () => {
    const posts = [
      { title: 'A', date: '2026-06-01' },
      { title: 'B', date: '2026-05-01' },
      { title: 'C', date: '2026-04-01' },
      { title: 'D', date: '2026-03-01' },
      { title: 'E', date: '2026-02-01' },
    ];
    const latest = getLatestPosts(posts);
    assert.equal(latest.length, 3);
    assert.equal(latest[0].title, 'A');
    assert.equal(latest[2].title, 'C');
  });
});
