# rinq

The website of rinq, a calendar for Windows, Android and Telegram, and the place its apps are
downloaded from: the [`android`](../../releases/tag/android) and [`windows`](../../releases/tag/windows)
releases always hold the newest builds. The apps' source code is private; this repository holds only
the website and the built apps.

## The website

Static pages in English (at the root), Russian (under `ru/`) and Ukrainian (under `uk/`):
- the home page, with the rinq window typing a plan into quick add, and the downloads;
- the Studio for YouTube and TikTok creators: an example channel with made-up numbers, and signing in
  to a rinq account to connect a channel;
- the plans (Free, Pro, Studio, Mix), the reviews and complaints;
- the terms, the privacy policy and the refund policy.

No cookies and no analytics. Everything comes from this site, under a strict Content-Security-Policy
(`vercel.json`, and the same in each page's head): no inline styles, no inline scripts, and the only
outside address the pages talk to is the Supabase project, with the publishable key.

- `npm run build` writes `dist/`; `npm test` checks it: every string in all three languages, no blank
  left unfilled, every link and image exists, no style attribute or inline script, no secret key, and
  that the prices on the plans page and in the terms agree. `npm run serve` shows `dist/` locally.
- `src/strings.json`: every string, `en`, `ru` and `uk`. Keys ending in `Html` go in unescaped.
  `{{ json:st }}` puts every string whose key starts with `st` into a page as JSON, for its script.
- `src/layout.html`: header and footer around every page.
- `src/pages/index.html`, `studio.html`, `pro.html`, `reviews.html`: one template for all languages.
- `src/pages/<name>.<lang>.html`: the long documents, one file per language.
- `src/static/`: the stylesheet, the Onest font, the logo and the scripts (`site.js` motion and the home
  window, `roll.js` rolling numbers, `studio.js`, `plans.js`, `reviews.js`).

**Downloads** come from the public repository lirenquinkk/rinq: its `android` and `windows` releases
always hold the newest `rinq.apk` and `rinq-setup.exe`, which the phone app's "Android APK" workflow and
the PC app's "Windows installer" workflow upload after each build of main (secret `RINQ_RELEASE_TOKEN`).
The site's links never change.

**Before publishing:** fill `operatorHtml`, `countryHtml`, `emailHtml` and `updatedHtml` in
`src/strings.json` (both languages). Then set `TERMS_URL`, `PRIVACY_URL` and `REFUNDS_URL` on Railway so the bot's
/terms links to the pages.

The documents are drafts, not legal advice. A lawyer's read is worth it before the first advertised
release.
