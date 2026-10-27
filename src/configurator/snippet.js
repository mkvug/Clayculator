import { normalizeConfig } from "../config.js";

const CONFIG_ID = "clayculator-config";

// The paste-in HTML a studio adds to their site. Settings travel as JSON in a script tag.
export function buildSnippet(config, scriptUrl) {
  const json = JSON.stringify(config, null, 2).replace(/</g, "\\u003c"); // keeps "</script>" out of the JSON
  return [
    '<div id="clayculator"></div>',
    `<script type="application/json" id="${CONFIG_ID}">`,
    json,
    "</script>",
    `<script src="${scriptUrl}" defer></script>`,
  ].join("\n");
}

// Read settings back from a saved snippet (or bare JSON). Throws if none are found.
export function parseSnippet(text) {
  const trimmed = text.trim();
  let json = trimmed;
  if (!trimmed.startsWith("{")) {
    const m = trimmed.match(/<script[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/i);
    if (!m) throw new Error("No Clayculator settings found in that text.");
    json = m[1];
  }
  return normalizeConfig(JSON.parse(json));
}

// Where the embed script lives: next to the page the configurator is served from.
export function embedScriptUrl() {
  return new URL("clayculator.js", window.location.href).href;
}
