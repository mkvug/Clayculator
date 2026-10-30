// Google Analytics for the setup page only (the embeddable calculator never loads it).
//
// - Runs only on the deployed site: not on localhost, `npm run dev`, `npm run preview`, or file:// pages.
// - Loads nothing until the visitor accepts. The choice is remembered in this browser.

const GA_ID = "G-S9D8ZB0K1X";
const KEY = "clayculator-analytics-consent"; // "granted" | "denied"

// True for a real, public site. Pure so it can be tested.
export function isLiveSite(hostname, protocol, dev = false) {
  if (dev || protocol === "file:") return false;
  const h = String(hostname).toLowerCase();
  if (!h || h === "localhost" || h === "[::1]" || h === "::1" || h.endsWith(".localhost") || h.endsWith(".local")) return false;
  if (/^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h)) return false;
  return true;
}

export const analyticsAvailable = () =>
  typeof window !== "undefined" && isLiveSite(window.location.hostname, window.location.protocol, import.meta.env.DEV);

export function getConsent() {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

let loaded = false;

function load() {
  if (loaded || !analyticsAvailable()) return;
  loaded = true;
  window["ga-disable-" + GA_ID] = false;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID);
  const tag = document.createElement("script");
  tag.async = true;
  tag.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
  document.head.appendChild(tag);
}

// Stop sending hits and remove the cookies Google set on this site.
function unload() {
  window["ga-disable-" + GA_ID] = true;
  const host = window.location.hostname;
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    if (name === "_ga" || name.startsWith("_ga_") || name === "_gid") {
      for (const domain of ["", "; domain=" + host, "; domain=." + host]) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
      }
    }
  });
}

export function setConsent(value) {
  try { localStorage.setItem(KEY, value); } catch { /* choice just won't be remembered */ }
  if (value === "granted") load();
  else unload();
}

// Call once at startup: loads analytics only if the visitor already said yes.
export function initAnalytics() {
  if (getConsent() === "granted") load();
}
