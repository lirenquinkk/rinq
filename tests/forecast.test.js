import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

// The Studio's slider reruns the bot's formula on the page (smart-calendar, src/shared/forecast.js):
// the same inputs must give the same numbers, or the page would contradict the forecast the bot saved.
const ROOT = path.join(import.meta.dirname, '..');
const window = {};
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'src/static/forecast.js'), 'utf8'), { window });
const { forecastOf } = window.rinqForecast;

// The bot's worked example: 5.2 subscribers per 1000 views, a video every 3.5 days, 10 000 views in a
// video's first week, 6 003 views a day from older videos, steady.
const EXAMPLE = { ready: true, window: 28, K: 5.2, P: 0.2857, N: 10000, Nlow: 10000, Nhigh: 10000, F: 6003, T: 1, viewsPerDay: 8860 };

test('the page computes what the bot computed', () => {
  const now = forecastOf(EXAMPLE, { horizon: 30 });
  assert.equal(now.viewsPerDay, 8860);
  assert.ok(Math.abs(now.expected - 1382) <= 1, `expected ${now.expected}`);
  assert.equal(now.low, now.expected);
  assert.equal(now.high, now.expected);
  assert.ok(Math.abs(forecastOf({ ...EXAMPLE, T: 1.03 }).expected - 1424) <= 1);
});

test('the slider: twice the videos, each a little less; none, only the old ones', () => {
  const twice = forecastOf(EXAMPLE, { perDay: EXAMPLE.P * 2 });
  assert.equal(twice.viewsPerDay, Math.round(EXAMPLE.F + 2 * EXAMPLE.P * EXAMPLE.N * 2 ** -0.25));
  assert.equal(forecastOf(EXAMPLE, { perDay: 0 }).viewsPerDay, EXAMPLE.F);
});

test('no forecast without a subscriber ratio or before the inputs are ready', () => {
  assert.equal(forecastOf({ ...EXAMPLE, K: null }), null);
  assert.equal(forecastOf({ ready: false, daysLeft: 3 }), null);
  assert.equal(forecastOf(undefined), null);
});

test('the Studio page loads the formula before its own script', () => {
  const html = fs.readFileSync(path.join(ROOT, 'src/pages/studio.html'), 'utf8');
  assert.ok(html.indexOf('src="/forecast.js"') > 0 && html.indexOf('src="/forecast.js"') < html.indexOf('src="/studio.js"'));
});
