import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { build, fill, readStrings, LANGS } from '../scripts/build.mjs';

const out = fs.mkdtempSync(path.join(os.tmpdir(), 'rinq-site-'));
const written = build({ out });

test('every page is built in both languages', () => {
  for (const name of ['index', 'terms', 'privacy', 'refunds']) {
    assert.ok(written.includes(`${name}.html`), name);
    assert.ok(written.includes(`ru/${name}.html`), `ru/${name}`);
  }
});

test('every string exists in both languages', () => {
  const strings = readStrings();
  for (const lang of LANGS) assert.deepEqual(Object.keys(strings[lang]).sort(), Object.keys(strings.en).sort(), lang);
});

test('a missing string stops the build', () => {
  assert.throws(() => fill('{{ nope }}', {}, 'test'), /no string "nope"/);
});

test('strings are escaped unless they are HTML', () => {
  assert.equal(fill('{{ a }} {{ bHtml }}', { a: '<b>', bHtml: '<b>' }, 'test'), '&lt;b&gt; <b>');
});

test('no page has a placeholder left, and each says its language', () => {
  for (const file of written) {
    const html = fs.readFileSync(path.join(out, file), 'utf8');
    assert.doesNotMatch(html, /\{\{|\}\}/, file);
    assert.match(html, new RegExp(`<html lang="${file.startsWith('ru/') ? 'ru' : 'en'}">`), file);
  }
});

test('every link and image inside the site points at a file that exists', () => {
  for (const file of written) {
    const html = fs.readFileSync(path.join(out, file), 'utf8');
    for (const [, ref] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:|mailto:|#)/.test(ref)) continue;
      const target = path.normalize(path.join(path.dirname(path.join(out, file)), ref.split('#')[0]));
      assert.ok(fs.existsSync(target), `${file} links to ${ref}`);
    }
  }
});

test('every image has alt text', () => {
  for (const file of written) {
    const html = fs.readFileSync(path.join(out, file), 'utf8');
    for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) assert.match(tag, /\balt="/, `${file}: ${tag}`);
  }
});

test('the site keeps no secret: only the publishable key', () => {
  const script = fs.readFileSync(path.join(out, 'feedback.js'), 'utf8');
  assert.match(script, /sb_publishable_/);
  assert.doesNotMatch(script, /sb_secret_|service_role/);
});

test('the page scripts can share one page: no top-level name is declared twice', async () => {
  // Classic scripts share one global scope; a second top-level `const KEY` stops that whole script.
  const { Script } = await import('node:vm');
  const dir = path.join(out);
  const scripts = fs.readdirSync(dir).filter((file) => file.endsWith('.js')).map((file) => fs.readFileSync(path.join(dir, file), 'utf8'));
  assert.doesNotThrow(() => new Script(scripts.join('\n;\n')), 'two scripts declare the same top-level name');
});

test('no page goes live with a blank left to fill', () => {
  for (const file of written) {
    const html = fs.readFileSync(path.join(out, file), 'utf8');
    assert.doesNotMatch(html, /class="fill"|\[(?:OPERATOR NAME|COUNTRY|EMAIL|DATE|ИМЯ ОПЕРАТОРА|СТРАНА|ДАТА)\]/, file);
  }
});
