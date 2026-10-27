// Entry for the embeddable script (dist/clayculator.js).
//
// Finds <div id="clayculator"> (or any [data-clayculator]) and reads its settings from
// <script type="application/json" id="clayculator-config"> (or the id named in data-config).
import { mountCalculator } from "./embed/mountCalculator.jsx";

function readConfig(el) {
  const id = el.getAttribute("data-config") || (el.id ? el.id + "-config" : "clayculator-config");
  const tag = document.getElementById(id);
  if (!tag) return {};
  try {
    return JSON.parse(tag.textContent);
  } catch (err) {
    console.warn("Clayculator: could not read settings from #" + id, err);
    return {};
  }
}

function init() {
  document.querySelectorAll("[data-clayculator], #clayculator").forEach((el) => {
    if (el.__clayculator) return;
    el.__clayculator = mountCalculator(el, readConfig(el));
  });
}

window.Clayculator = { mount: mountCalculator, init };

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
