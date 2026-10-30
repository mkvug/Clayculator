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
| `showVolume` | `true` / `false` | Advanced. Show how much the piece holds. Off by default. |
| `volumeSizing` | `true` / `false` | Advanced. Add a "Volume" option to "Size by" so students can enter a target such as 12 fl oz. Off by default. |
| `volumeUnit` | `"floz"` / `"cup"` / `"ml"` / `"l"` | Starting volume units. |
| `wallMm`, `floorMm` | number (mm) | Default fired wall and floor thickness used for volume. Students can change them. |
| `unit` | `"in"` / `"cm"` | Starting units. |
| `theme` | `"light"` / `"dark"` / `"auto"` | `auto` follows the visitor's device. |
| `accent` | `"#rrggbb"` or `""` | Button and outline color. |
| `heading`, `intro` | text | Shown above the calculator. Empty hides them. |

## Volume (advanced)

When enabled, the calculator estimates how much the finished piece holds, and can work the other way: a student enters a target volume and the drawn shape is scaled until it holds that.

The student draws the outside of the pot, so the inside is found by moving that outline inward by the wall thickness (and by the floor thickness where the surface faces up). Capacity is the volume of that inside shape up to the rim, in `src/lib/volume.js`. For a target volume the shape is scaled uniformly while walls and floor keep their real thickness, so doubling the size does not exactly double the volume. The result is an estimate from a sketch.

With volume sizing on, a student can also tick **Also match a volume** while sizing by height or widest diameter. That dimension is held exactly and the sketch is stretched the other way (wider or narrower for a set height, taller or shorter for a set width) until it holds the target. The page says how far the sketch was stretched, and warns when it is more than 25%.

## Hosting it

`npm run build` produces `dist/`:

- `dist/index.html` + `dist/assets/`: the setup page
- `dist/clayculator.js`: the embed script

Upload the whole `dist/` folder to any static host (GitHub Pages, Netlify, Cloudflare Pages, a plain web server). The setup page builds the snippet's script address from where it is served, so the snippet points at the `clayculator.js` beside it. Open the hosted setup page, not a file on your computer, when copying code for a live site.

### GitHub Pages

`.github/workflows/pages.yml` builds and publishes `dist/` on every push to `main`. One-time setup: in the repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**. The setup page is then served at `https://<owner>.github.io/<repo>/`, with `clayculator.js` beside it. GitHub Pages on a private repository requires a paid GitHub plan, and the published site is public.

### Analytics and cookies

The setup page (not the embeddable calculator) can use Google Analytics. It is off on localhost, `npm run dev`, `npm run preview` and `file://` pages, and on the deployed site it loads only after the visitor clicks **Accept** in the cookie notice. **Decline** loads nothing. The choice is remembered in the browser and can be changed from **Cookie settings** at the bottom of the page. The measurement ID is `GA_ID` in `src/analytics.js`.

## Development

```
npm install
npm run dev      # setup page with hot reload (the embed script isn't served in dev)
npm run build    # setup page + embed script into dist/
npm run preview  # serve dist/ locally to try the full flow
npm test         # unit tests for the volume math
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
