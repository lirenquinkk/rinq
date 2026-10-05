// Builds rinq's website into dist/: every page in English (at the root) and Russian (under ru/).
// A page is either one template for both languages, filled from src/strings.json, or a hand-written
// file per language (name.en.html, name.ru.html) for the long documents. Every page goes into
// src/layout.html. {{ key }} is replaced with the string, HTML-escaped; keys ending in "Html" go in as
// they are. A key missing in either language, or a {{ }} left over, stops the build.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const LANGS = ['en', 'ru'];
const PLACEHOLDER = /\{\{\s*([A-Za-z][A-Za-z0-9_]*)\s*\}\}/g;

const escape = (text) => String(text).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

export function fill(template, values, where) {
  const out = template.replace(PLACEHOLDER, (_, key) => {
    if (!(key in values)) throw new Error(`${where}: no string "${key}"`);
    return key.endsWith('Html') ? values[key] : escape(values[key]);
  });
  const left = out.match(/\{\{[^}]*\}\}/);
  if (left) throw new Error(`${where}: "${left[0]}" was not filled`);
  return out;
}

export function readStrings(dir = ROOT) {
  const strings = JSON.parse(fs.readFileSync(path.join(dir, 'src/strings.json'), 'utf8'));
  for (const lang of LANGS) if (!strings[lang]) throw new Error(`strings.json has no "${lang}"`);
  const keys = new Set(LANGS.flatMap((lang) => Object.keys(strings[lang])));
  for (const key of keys) for (const lang of LANGS) {
    if (typeof strings[lang][key] !== 'string') throw new Error(`strings.json: "${key}" is missing in ${lang}`);
  }
  return strings;
}

/** The pages: [{ name, en, ru }] with each language's body template. */
export function readPages(dir = ROOT) {
  const files = fs.readdirSync(path.join(dir, 'src/pages'));
  const names = [...new Set(files.map((file) => file.split('.')[0]))].sort();
  return names.map((name) => {
    const page = { name };
    for (const lang of LANGS) {
      const own = `${name}.${lang}.html`;
      const file = files.includes(own) ? own : `${name}.html`;
      if (!files.includes(file)) throw new Error(`page "${name}" has nothing for ${lang}`);
      page[lang] = fs.readFileSync(path.join(dir, 'src/pages', file), 'utf8');
    }
    return page;
  });
}

const fileOf = (name, lang) => `${lang === 'en' ? '' : `${lang}/`}${name}.html`;

export function build({ dir = ROOT, out = path.join(ROOT, 'dist') } = {}) {
  const strings = readStrings(dir);
  const layout = fs.readFileSync(path.join(dir, 'src/layout.html'), 'utf8');
  fs.rmSync(out, { recursive: true, force: true });
  const written = [];
  for (const page of readPages(dir)) {
    for (const lang of LANGS) {
      const other = LANGS.find((l) => l !== lang);
      const root = lang === 'en' ? '' : '../';
      const values = { ...strings[lang], lang, root, page: page.name };
      // A hand-written document names its own title in its first line.
      const title = /^<!--\s*title:\s*(.*?)\s*-->/.exec(page[lang]);
      values.title = title ? `${title[1]} · rinq` : strings[lang][`title_${page.name}`];
      values.description = strings[lang][`desc_${page.name}`] ?? strings[lang].desc_index;
      if (!values.title) throw new Error(`page "${page.name}" has no title in ${lang}`);
      values.contentHtml = fill(page[lang].replace(/^<!--.*?-->\n?/, ''), values, `${page.name} (${lang})`);
      values.otherHref = `${root}${fileOf(page.name, other)}`;
      values.otherLang = strings[other].langName;
      values.otherCode = other;
      values.selfHref = fileOf(page.name, lang);
      const html = fill(layout, values, `layout for ${page.name} (${lang})`);
      const target = path.join(out, fileOf(page.name, lang));
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, html);
      written.push(fileOf(page.name, lang));
    }
  }
  fs.cpSync(path.join(dir, 'src/static'), out, { recursive: true });
  return written;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const written = build();
  console.log(`built ${written.length} pages into dist/`);
}
