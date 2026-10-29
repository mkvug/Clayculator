// Studio configuration: the clay bodies on offer plus a few display options.
// The configurator edits this shape and the exported embed snippet carries it as JSON.

export const CUSTOM = "custom";

export const DEFAULT_CONFIG = {
  heading: "Throwing Size Calculator",
  intro: "Sketch half of your piece, choose your clay, set the final size, and get the dimensions to throw at.",
  unit: "in",              // "in" | "cm"
  theme: "auto",           // "light" | "dark" | "auto" (follows the visitor's device)
  accent: "",              // "#rrggbb", or "" for the theme default
  allowCustom: true,       // let students type their own shrinkage
  showVolume: false,       // advanced: show how much the piece holds
  volumeSizing: false,     // advanced: let students size by a target volume
  volumeUnit: "floz",      // "floz" | "cup" | "ml" | "l"
  wallMm: 6.35,            // default fired wall thickness, in millimeters
  floorMm: 9.525,          // default fired floor thickness, in millimeters
  defaultClay: "stoneware",
  clays: [
    { id: "earthenware", name: "Earthenware", shrinkage: 6, note: "" },
    { id: "stoneware", name: "Stoneware", shrinkage: 12, note: "" },
    { id: "porcelain", name: "Porcelain", shrinkage: 15, note: "" },
  ],
};

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const str = (v, fallback) => (typeof v === "string" ? v : fallback);
const oneOf = (v, options, fallback) => (options.includes(v) ? v : fallback);

// Accept anything (hand-edited JSON, an old snippet) and return a safe, complete config.
export function normalizeConfig(raw) {
  const r = raw && typeof raw === "object" ? raw : {};
  const seen = new Set();
  const clays = (Array.isArray(r.clays) ? r.clays : [])
    .map((c, i) => {
      if (!c || typeof c !== "object") return null;
      const name = str(c.name, "").trim();
      const shrinkage = parseFloat(c.shrinkage);
      if (!name || !Number.isFinite(shrinkage) || shrinkage < 0 || shrinkage >= 100) return null;
      let id = str(c.id, "") || slug(name) || "clay-" + i;
      while (seen.has(id)) id += "-2";
      seen.add(id);
      return { id, name, shrinkage, note: str(c.note, "").trim() };
    })
    .filter(Boolean);

  const accent = /^#[0-9a-f]{6}$/i.test(r.accent) ? r.accent : "";
  const mm = (v, fallback, max) => {
    const n = parseFloat(v);
    return Number.isFinite(n) && n >= 1 ? Math.min(n, max) : fallback;
  };
  return {
    heading: str(r.heading, DEFAULT_CONFIG.heading),
    intro: str(r.intro, DEFAULT_CONFIG.intro),
    unit: oneOf(r.unit, ["in", "cm"], "in"),
    theme: oneOf(r.theme, ["light", "dark", "auto"], "auto"),
    accent,
    allowCustom: clays.length === 0 ? true : r.allowCustom !== false,
    showVolume: r.showVolume === true,
    volumeSizing: r.volumeSizing === true,
    volumeUnit: oneOf(r.volumeUnit, ["floz", "cup", "ml", "l"], "floz"),
    wallMm: mm(r.wallMm, DEFAULT_CONFIG.wallMm, 30),
    floorMm: mm(r.floorMm, DEFAULT_CONFIG.floorMm, 40),
    defaultClay: clays.some((c) => c.id === r.defaultClay) ? r.defaultClay : clays[0] ? clays[0].id : CUSTOM,
    clays,
  };
}

// Readable text colour (black or white) for a button filled with the given hex colour.
export function contrastText(hex) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? "#000000" : "#ffffff";
}
