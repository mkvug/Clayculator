import { createRoot } from "react-dom/client";
import Calculator from "../Calculator.jsx";
import { normalizeConfig } from "../config.js";
import css from "../calculator.css?inline";

// Render the calculator into `el` inside a shadow root, so the host page's CSS can't touch it
// and ours can't leak out. Returns { update(config), unmount() }.
export function mountCalculator(el, rawConfig) {
  const shadow = el.shadowRoot || el.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = css;
  const mountPoint = document.createElement("div");
  shadow.replaceChildren(style, mountPoint);

  const root = createRoot(mountPoint);
  const render = (cfg) => root.render(<Calculator config={normalizeConfig(cfg)} />);
  render(rawConfig);

  return { update: render, unmount: () => root.unmount() };
}
