// Builds rinq's website into dist/: every page in English (at the root), Russian (under ru/) and
// Ukrainian (under uk/). A page is either one template for all three, filled from src/strings.json
// (index.html, studio.html, …), or a hand-written file per language for the long documents
// (terms.en.html, terms.ru.html, terms.uk.html), whose first line names its title. Every page goes into
// src/layout.html.
//
// {{ key }} is replaced with the string, HTML-escaped; keys ending in "Html" go in as they are.
// {{ json:st }} becomes every string whose key starts with "st", as a JSON object, for the scripts that
// draw text themselves; "<" is escaped so it can sit inside a <script> element. A string missing in any
// language, or a {{ }} left over, stops the build.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const LANGS = ['en', 'ru', 'uk'];
const LABELS = { en: 'EN', ru: 'RU', uk: 'UK' };
const NAMES = { en: 'English', ru: 'Русский', uk: 'Українська' };
const PLACEHOLDER = /\{\{\s*([A-Za-z][A-Za-z0-9_]*)\s*\}\}/g;
const JSON_PLACEHOLDER = /\{\{\s*json:([A-Za-z0-9_]+)\s*\}\}/g;

const escape = (text) => String(text).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

export function fill(template, values, where) {
  const out = template
    .replace(JSON_PLACEHOLDER, (_, prefix) => {
      const picked = Object.fromEntries(Object.entries(values).filter(([key]) => key.startsWith(prefix)));
      if (!Object.keys(picked).length) throw new Error(`${where}: no strings start with "${prefix}"`);
      return JSON.stringify(picked).replaceAll('<', '\\u003c');
    })
    .replace(PLACEHOLDER, (_, key) => {
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

/** The pages: [{ name, en, ru, uk }] with each language's body template. */
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

const baseOf = (lang) => (lang === 'en' ? '' : `/${lang}`);
const fileOf = (name, lang) => `${lang === 'en' ? '' : `${lang}/`}${name}.html`;

export function build({ dir = ROOT, out = path.join(ROOT, 'dist') } = {}) {
  const strings = readStrings(dir);
  const layout = fs.readFileSync(path.join(dir, 'src/layout.html'), 'utf8');
  fs.rmSync(out, { recursive: true, force: true });
  const written = [];
  for (const page of readPages(dir)) {
    for (const lang of LANGS) {
      const values = { ...strings[lang], lang, base: baseOf(lang), page: page.name };
      // A hand-written document names its own title in its first line.
      const title = /^<!--\s*title:\s*(.*?)\s*-->/.exec(page[lang]);
      values.pageTitle = title ? `${title[1]} · rinq` : strings[lang][`title_${page.name}`];
      values.metaDescription = strings[lang][`desc_${page.name}`] ?? strings[lang].metaDescription;
      if (!values.pageTitle) throw new Error(`page "${page.name}" has no title in ${lang}`);
      // The same page in the other languages, for search engines and for the switch in the header.
      values.alternatesHtml = LANGS.filter((other) => other !== lang)
        .map((other) => `<link rel="alternate" hreflang="${other}" href="${baseOf(other)}/${page.name}.html">`).join('\n');
      values.langLinksHtml = LANGS.map((other) => `<a href="${baseOf(other)}/${page.name}.html" hreflang="${other}" lang="${other}" title="${NAMES[other]}"${other === lang ? ' aria-current="true"' : ''}>${LABELS[other]}</a>`).join('');
      values.contentHtml = fill(page[lang].replace(/^<!--.*?-->\n?/, ''), values, `${page.name} (${lang})`);
      // A document's body sits in the reading column; the designed pages lay themselves out.
      values.mainClass = title ? 'prose' : `page-${page.name}`;
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
