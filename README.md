# rinq

The website of rinq, a calendar for Windows, Android and Telegram, and the place its apps are
downloaded from: the [`android`](../../releases/tag/android) and [`windows`](../../releases/tag/windows)
releases always hold the newest builds. The apps' source code is private; this repository holds only
the website and the built apps.

## The website

Plain static pages in English (at the root) and Russian (under `ru/`): the home page with downloads,
Pro, reviews and complaints, and the terms, privacy policy and refund policy. No cookies, no
analytics, nothing loaded from other sites. The only script sends and reads reviews and complaints
(`public.feedback`, with the publishable key).

- `npm run build` writes `dist/`; `npm test` checks it (every string in both languages, no blank
  left unfilled, every link and image exists, every image has alt text, no secret key).
- `src/strings.json`: every string, `en` and `ru`. Keys ending in `Html` go in unescaped.
- `src/layout.html`: header and footer around every page.
- `src/pages/index.html`: the home page, one template for both languages.
- `src/pages/<name>.<lang>.html`: the long documents, one file per language.
- `src/static/`: the stylesheet, the form script, the icon and the screenshots (taken from the apps'
  browser previews, in both languages).

**Downloads** come from the public repository lirenquinkk/rinq: its `android` and `windows` releases
always hold the newest `rinq.apk` and `rinq-setup.exe`, which the phone app's "Android APK" workflow and
the PC app's "Windows installer" workflow upload after each build of main (secret `RINQ_RELEASE_TOKEN`).
The site's links never change.

**Before publishing:** fill `operatorHtml`, `countryHtml`, `emailHtml` and `updatedHtml` in
`src/strings.json` (both languages). Then set `TERMS_URL`, `PRIVACY_URL` and `REFUNDS_URL` on Railway so the bot's
/terms links to the pages.

The documents are drafts, not legal advice. A lawyer's read is worth it before the first advertised
release.
