// The Studio's subscriber forecast: the same formula the bot saves once a day (smart-calendar,
// src/shared/forecast.js, forecastOf), here so the posting slider can rerun it on the page. Plain
// arithmetic over the channel's own numbers: no AI, nothing is sent anywhere.
//
//   views a day      = F + P × N × (P' / P)^-0.25
//   subscribers in H = views a day × K / 1000 × H × T
window.rinqForecast = (() => {
  const SHARE = 0.25;

  /** { expected, low, high, viewsPerDay } over `horizon` days, or null without a subscriber ratio. */
  function forecastOf(inputs, { horizon = 30, perDay } = {}) {
    if (!inputs?.ready || inputs.K === null || inputs.K === undefined) return null;
    const P = perDay ?? inputs.P;
    const share = inputs.P > 0 && P > 0 ? (P / inputs.P) ** -SHARE : 1;
    const views = (n) => inputs.F + P * n * share;
    const subscribers = (n) => (views(n) * inputs.K / 1000) * horizon * inputs.T;
    const expected = Math.round(subscribers(inputs.N));
    return {
      expected,
      low: Math.min(expected, Math.round(subscribers(inputs.Nlow))),
      high: Math.max(expected, Math.round(subscribers(inputs.Nhigh))),
      viewsPerDay: Math.round(views(inputs.N)),
    };
  }

  return { forecastOf };
})();
