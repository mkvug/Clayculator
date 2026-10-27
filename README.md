# Clayculator

A throwing-size calculator for potters. A student sketches half of the profile they want, picks a clay body, sets the final size, and gets the size to throw at on the wheel, plus a table of diameters to check while throwing.

Thrown size = final size ÷ (1 − shrinkage). Shrinkage is measured against the wet size.

The project has two parts:

- **Setup page** (`index.html`): a studio lists the clay bodies it offers (name, shrinkage %, optional note), chooses text, units, theme and a color, sees a live preview, and copies an embed snippet.
- **Embed script** (`clayculator.js`): the calculator itself. It renders into a shadow root, so the studio website's CSS can't break it and it can't change the site's styles.

## What a studio does

1. Open the hosted setup page.
2. Replace the example clay bodies with the studio's own.
3. Copy the code and paste it into an HTML / embed / code block on their website.

The settings live inside the pasted code as JSON, so there is no account or database. To edit later, paste the saved code into **Edit an existing embed** on the setup page.

The snippet looks like this:

```html
<div id="clayculator"></div>
<script type="application/json" id="clayculator-config">
{ "clays": [{ "id": "stoneware", "name": "Stoneware", "shrinkage": 12, "note": "" }], "unit": "in", "theme": "auto" }
</script>
<script src="https://YOUR-HOST/clayculator.js" defer></script>
```

Some website builders limit script tags to higher plans. Where scripts aren't allowed, link to a page that hosts the calculator instead.

## Settings

| Key | Values | Meaning |
| --- | --- | --- |
| `clays` | `[{ id, name, shrinkage, note }]` | The studio's clay bodies. `shrinkage` is a percentage from 0 to 99. |
| `defaultClay` | a clay `id` | Selected when the page loads. |
| `allowCustom` | `true` / `false` | Show a "Custom shrinkage" option. Always on if there are no clays. |
| `unit` | `"in"` / `"cm"` | Starting units. |
| `theme` | `"light"` / `"dark"` / `"auto"` | `auto` follows the visitor's device. |
| `accent` | `"#rrggbb"` or `""` | Button and outline color. |
| `heading`, `intro` | text | Shown above the calculator. Empty hides them. |

## Hosting it

`npm run build` produces `dist/`:

- `dist/index.html` + `dist/assets/`: the setup page
- `dist/clayculator.js`: the embed script

Upload the whole `dist/` folder to any static host (GitHub Pages, Netlify, Cloudflare Pages, a plain web server). The setup page builds the snippet's script address from where it is served, so the snippet points at the `clayculator.js` beside it. Open the hosted setup page, not a file on your computer, when copying code for a live site.

## Development

```
npm install
npm run dev      # setup page with hot reload (the embed script isn't served in dev)
npm run build    # setup page + embed script into dist/
npm run preview  # serve dist/ locally to try the full flow
```

```
src/
  config.js            defaults, normalizeConfig (validates any settings JSON)
  Calculator.jsx       the calculator students see
  calculator.css       all calculator styles, scoped to .cc
  components/          calculator panels and small controls
  hooks/useProfile.js  drawn points, undo, selection
  lib/                 pure math: geometry.js, calc.js, constants.js
  embed.jsx            entry for dist/clayculator.js
  embed/mountCalculator.jsx   mounts the calculator in a shadow root (also used by the preview)
  configurator/        the setup page
```
