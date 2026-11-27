import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { build, fill, readStrings, LANGS } from '../scripts/build.mjs';

const ROOT = path.join(import.meta.dirname, '..');
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'rinq-site-'));
const written = build({ out });
const read = (file) => fs.readFileSync(path.join(out, file), 'utf8');
const langOf = (file) => (file.startsWith('ru/') ? 'ru' : file.startsWith('uk/') ? 'uk' : 'en');

test('every page is built in English, Russian and Ukrainian', () => {
  assert.deepEqual(LANGS, ['en', 'ru', 'uk']);
  for (const name of ['index', 'studio', 'pro', 'reviews', 'terms', 'privacy', 'refunds']) {
    for (const prefix of ['', 'ru/', 'uk/']) assert.ok(written.includes(`${prefix}${name}.html`), `${prefix}${name}`);
  }
});

test('every string exists in every language', () => {
  const strings = readStrings();
  for (const lang of LANGS) assert.deepEqual(Object.keys(strings[lang]).sort(), Object.keys(strings.en).sort(), lang);
});

test('a missing string stops the build', () => {
  assert.throws(() => fill('{{ nope }}', {}, 'test'), /no string "nope"/);
});

test('strings are escaped unless they are HTML', () => {
  assert.equal(fill('{{ a }} {{ bHtml }}', { a: '<b>', bHtml: '<b>' }, 'test'), '&lt;b&gt; <b>');
});

test('json: puts every string with a prefix into the page as JSON, with < escaped', () => {
  const html = fill('<script>{{ json:st }}</script>', { stA: 'a<b', stB: 'b', other: 'x' }, 'test');
  assert.equal(html, '<script>{"stA":"a\\u003cb","stB":"b"}</script>');
  assert.throws(() => fill('{{ json:zz }}', { a: 'x' }, 'test'), /zz/);
});

test('no page has a placeholder left, and each says its language', () => {
  for (const file of written) {
    const html = read(file);
    assert.doesNotMatch(html, /\{\{|\}\}/, file);
    assert.match(html, new RegExp(`<html lang="${langOf(file)}">`), file);
  }
});

test('each page points at its twins in the other languages, and the switch names all three', () => {
  const uk = read('uk/studio.html');
  assert.match(read('index.html'), /<link rel="alternate" hreflang="uk" href="\/uk\/index.html">/);
  assert.match(uk, /<link rel="alternate" hreflang="en" href="\/studio.html">/);
  assert.match(uk, /<a href="\/ru\/studio.html" hreflang="ru"[^>]*>RU<\/a>/);
  assert.match(uk, /<a href="\/uk\/studio.html" hreflang="uk"[^>]*aria-current="true">UK<\/a>/);
});

test('every link and image inside the site points at a file that exists', () => {
  for (const file of written) {
    const html = read(file);
    for (const [, ref] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:|mailto:|#)/.test(ref)) continue;
      const base = ref.startsWith('/') ? out : path.dirname(path.join(out, file));
      const target = path.normalize(path.join(base, ref.split('#')[0]));
      assert.ok(fs.existsSync(target), `${file} links to ${ref}`);
    }
  }
});

test('every image has alt text', () => {
  for (const file of written) {
    for (const [tag] of read(file).matchAll(/<img\b[^>]*>/g)) assert.match(tag, /\balt="/, `${file}: ${tag}`);
  }
});

// The pages run under a Content-Security-Policy with style-src 'self': a style attribute would be
// dropped, so everything a page needs is in style.css. (Scripts may still set styles through the DOM.)
test('no page carries an inline style or an inline script, and every page states the policy', () => {
  for (const file of written) {
    const html = read(file);
    assert.doesNotMatch(html, /\sstyle="/, `${file} has a style attribute`);
    for (const [tag] of html.matchAll(/<script\b[^>]*>/g)) {
      assert.ok(/\bsrc="/.test(tag) || /type="application\/json"/.test(tag), `${file}: ${tag} runs inline`);
    }
    assert.match(html, /http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self';/, file);
  }
  const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
  const policy = vercel.headers[0].headers.find((h) => h.key === 'Content-Security-Policy').value;
  assert.match(policy, /style-src 'self';/);
  assert.match(policy, /img-src 'self' https:\/\/yt3\.ggpht\.com https:\/\/i\.ytimg\.com;/);
  assert.match(policy, /connect-src https:\/\/psesapmlbjukmdnxkcrv\.supabase\.co;/);
});

test('the Studio and the home window get their strings as JSON that parses', () => {
  for (const [file, id] of [['ru/studio.html', 'st-strings'], ['uk/index.html', 'grid-strings'], ['studio.html', 'st-strings']]) {
    const json = new RegExp(`<script type="application/json" id="${id}">([^<]*)</script>`).exec(read(file))?.[1];
    assert.ok(json, `${file} has no ${id}`);
    assert.ok(Object.keys(JSON.parse(json)).length > 10, `${file} ${id} is nearly empty`);
  }
});

test('the site keeps no secret: only the publishable key', () => {
  for (const name of ['reviews.js', 'studio.js']) {
    const script = read(name);
    assert.match(script, /PUBLISHABLE_KEY = 'sb_publishable_/, name);
    assert.doesNotMatch(script, /sb_secret_|service_role/, name);
  }
});

test('the page scripts can share one page: no top-level name is declared twice', async () => {
  // Classic scripts share one global scope; a second top-level `const KEY` stops that whole script.
  const { Script } = await import('node:vm');
  const scripts = fs.readdirSync(out).filter((file) => file.endsWith('.js')).map((file) => read(file));
  assert.doesNotThrow(() => new Script(scripts.join('\n;\n')), 'two scripts declare the same top-level name');
});

test('no page goes live with a blank left to fill', () => {
  for (const file of written) {
    assert.doesNotMatch(read(file), /class="fill"|\[(?:OPERATOR NAME|COUNTRY|EMAIL|DATE|ИМЯ ОПЕРАТОРА|СТРАНА|ДАТА)\]/, file);
  }
});

test('downloads and buying point where the apps and the bot live', () => {
  const strings = readStrings();
  for (const lang of LANGS) {
    assert.equal(strings[lang].downloadWindowsHref, 'https://github.com/lirenquinkk/rinq/releases/download/windows/rinq-setup.exe', lang);
    assert.equal(strings[lang].androidHref, 'https://github.com/lirenquinkk/rinq/releases/download/android/rinq.apk', lang);
    assert.equal(strings[lang].prBotHref, 'https://t.me/lirencalendarbot?start=pro', lang);
  }
});

test('the prices: Pro 150, Studio 200, Mix 300 Stars a month, a year is ten months, and the documents agree', () => {
  const html = fs.readFileSync(path.join(ROOT, 'src/pages/pro.html'), 'utf8');
  assert.deepEqual([...html.matchAll(/data-month="(\d+)"/g)].map((m) => Number(m[1])), [150, 200, 300]);
  assert.match(fs.readFileSync(path.join(ROOT, 'src/static/plans.js'), 'utf8'), /month \* 10/);
  for (const lang of LANGS) {
    const terms = fs.readFileSync(path.join(ROOT, `src/pages/terms.${lang}.html`), 'utf8');
    assert.match(terms, /150 Telegram Stars/, lang);
    assert.match(terms, /500/, lang);
    assert.doesNotMatch(terms, /\b200 Telegram Stars|\b100 voice|\b100 голос/, lang);
  }
});
