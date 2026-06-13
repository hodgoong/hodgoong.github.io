import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { parse } from 'node:path';

const ROOT = join(import.meta.dirname, '..', '..');
const OUT = join(ROOT, 'out');

before(() => {
  // TC-E01 step 1: clean out directory
  if (existsSync(OUT)) {
    rmSync(OUT, { recursive: true });
  }
  // TC-E01 step 2: run full build
  execSync('node build.js', { cwd: ROOT, stdio: 'pipe' });
});

// --- TC-I01: Full build generates post page at correct path ---
describe('Post page output', () => {
  it('TC-I01: generates out/blog/hello-world/index.html', () => {
    const postPath = join(OUT, 'blog', 'hello-world', 'index.html');
    assert.ok(existsSync(postPath), 'post page does not exist');
    const content = readFileSync(postPath, 'utf-8');
    assert.ok(content.length > 0, 'post page is empty');
  });

  // --- TC-I06: Post page has correct relative path to style.css ---
  it('TC-I06: post page references ../../style.css', () => {
    const postPath = join(OUT, 'blog', 'hello-world', 'index.html');
    const content = readFileSync(postPath, 'utf-8');
    assert.ok(content.includes('../../style.css'), 'incorrect style.css path');
  });
});

// --- TC-I02: Full build generates listing page ---
describe('Listing page output', () => {
  it('TC-I02: generates out/blog/index.html with post content and filter attributes', () => {
    const listingPath = join(OUT, 'blog', 'index.html');
    assert.ok(existsSync(listingPath), 'listing page does not exist');
    const content = readFileSync(listingPath, 'utf-8');
    assert.ok(content.includes('Hello World') || content.includes('hello-world'),
      'listing page missing post title or slug');
    assert.ok(content.includes('data-tags') || content.includes('data-category'),
      'listing page missing filter data attributes');
  });
});

// --- TC-I03: Landing page has latest posts injected ---
describe('Landing page output', () => {
  it('TC-I03: out/index.html has latest posts between markers', () => {
    const indexPath = join(OUT, 'index.html');
    assert.ok(existsSync(indexPath), 'landing page does not exist');
    const content = readFileSync(indexPath, 'utf-8');
    assert.ok(content.includes('<!-- BLOG_LATEST -->'), 'missing opening marker');
    assert.ok(content.includes('<!-- /BLOG_LATEST -->'), 'missing closing marker');
    // Between markers should have content (not empty)
    const between = content.split('<!-- BLOG_LATEST -->')[1].split('<!-- /BLOG_LATEST -->')[0];
    assert.ok(between.trim().length > 0, 'no content injected between markers');
  });
});

// --- TC-I04: Static files copied correctly ---
describe('Static file copy', () => {
  it('TC-I04: style.css and cv.html copied to out/', () => {
    assert.ok(existsSync(join(OUT, 'style.css')), 'style.css not copied');
    assert.ok(existsSync(join(OUT, 'cv.html')), 'cv.html not copied');

    const srcCss = readFileSync(join(ROOT, 'v2', 'style.css'), 'utf-8');
    const outCss = readFileSync(join(OUT, 'style.css'), 'utf-8');
    assert.equal(srcCss, outCss, 'style.css content mismatch');
  });

  it('TC-I04b: v1/contents/img/ directory copied', () => {
    const imgDir = join(OUT, 'v1', 'contents', 'img');
    assert.ok(existsSync(imgDir), 'v1/contents/img/ not copied');
    const files = readdirSync(imgDir, { recursive: true });
    assert.ok(files.length > 0, 'image directory is empty');
  });
});

// --- TC-I05: Nav contains Blog link in all pages ---
describe('Navigation', () => {
  it('TC-I05: all pages have Blog nav link', () => {
    const pages = [
      join(OUT, 'index.html'),
      join(OUT, 'blog', 'index.html'),
      join(OUT, 'blog', 'hello-world', 'index.html'),
    ];
    for (const page of pages) {
      const content = readFileSync(page, 'utf-8');
      assert.ok(
        content.includes('Blog') && content.includes('/blog'),
        `Blog nav link missing in ${page}`,
      );
    }
  });
});

// --- TC-I07: GitHub Action workflow is valid YAML ---
describe('GitHub Action workflow', () => {
  it('TC-I07: workflow file exists and contains expected steps', () => {
    const workflowDir = join(ROOT, '.github', 'workflows');
    const files = readdirSync(workflowDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
    assert.ok(files.length > 0, 'no workflow files found');

    // Read the first workflow file
    const content = readFileSync(join(workflowDir, files[0]), 'utf-8');
    assert.ok(content.includes('master') || content.includes('main'), 'missing branch trigger');
    assert.ok(
      content.includes('node build.js') || content.includes('npm run build'),
      'missing build step',
    );
    assert.ok(content.includes('./out') || content.includes('out'), 'missing out/ artifact path');
  });
});

// --- TC-E01: Clean build produces complete output ---
describe('E2E: complete build output', () => {
  it('TC-E01: out/ contains all expected files', () => {
    const expected = [
      'index.html',
      'style.css',
      'cv.html',
      join('blog', 'index.html'),
      join('blog', 'hello-world', 'index.html'),
    ];
    for (const file of expected) {
      assert.ok(existsSync(join(OUT, file)), `missing: out/${file}`);
    }
  });
});
