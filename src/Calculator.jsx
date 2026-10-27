import { useEffect, useMemo, useState } from "react";
import ShrinkagePanel from "./components/ShrinkagePanel.jsx";
import ProfilePanel from "./components/ProfilePanel.jsx";
import SizePanel from "./components/SizePanel.jsx";
import ResultPanel from "./components/ResultPanel.jsx";
import useProfile from "./hooks/useProfile.js";
import { buildProfile, computeThrow } from "./lib/calc.js";
import { CUSTOM, contrastText } from "./config.js";

// The calculator students see. `config` must already be normalized (see normalizeConfig).
export default function Calculator({ config }) {
  const { clays, allowCustom } = config;
  const [clayId, setClayId] = useState(config.defaultClay);
  const [customPct, setCustomPct] = useState("12");
  const [unit, setUnit] = useState(config.unit);
  const [smooth, setSmooth] = useState(true);
  const [sizeBy, setSizeBy] = useState("h");
  const [size, setSize] = useState("8");
  const profile = useProfile();

  // Follow configurator changes to these settings (the live preview).
  useEffect(() => setClayId(config.defaultClay), [config.defaultClay]);
  useEffect(() => setUnit(config.unit), [config.unit]);

  const isCustom = clays.length === 0 || (clayId === CUSTOM && allowCustom);
  const clay = isCustom
    ? null
    : clays.find((c) => c.id === clayId) || clays.find((c) => c.id === config.defaultClay) || clays[0];

  const onClayChange = (id) => {
    if (id === CUSTOM && clay) setCustomPct(String(clay.shrinkage));
    setClayId(id);
  };

  const pctNum = isCustom ? parseFloat(customPct) : clay.shrinkage;
  const sizeNum = parseFloat(size);
  const pctOk = pctNum >= 0 && pctNum < 100;
  const sizeOk = sizeNum > 0;

  const built = useMemo(
    () => buildProfile(profile.pts, smooth, sizeBy),
    [profile.pts, smooth, sizeBy]
  );
  const result = built && pctOk && sizeOk ? computeThrow(built, pctNum, sizeNum) : null;

  let error = null;
  if (!result) {
    if (profile.pts.length < 2) error = "Add at least two points to the profile.";
    else if (!pctOk) error = "Shrinkage must be at least 0 and under 100%.";
    else if (!sizeOk) error = "Enter a final size greater than zero.";
    else error = `The drawn shape has no ${sizeBy === "h" ? "height" : "width"}. Spread the points out, or switch what you size by.`;
  }

  const accentStyle = config.accent
    ? { "--accent": config.accent, "--accent-fg": contrastText(config.accent) }
    : undefined;

  return (
    <div className="cc" data-theme={config.theme} style={accentStyle}>
      <div className="wrap">
        {(config.heading || config.intro) && (
          <header>
            {config.heading && <h1>{config.heading}</h1>}
            {config.intro && <p className="lede">{config.intro}</p>}
          </header>
        )}
        <ShrinkagePanel clays={clays} allowCustom={allowCustom} clay={clay} isCustom={isCustom}
          onClayChange={onClayChange} customPct={customPct} onCustomChange={setCustomPct} />
        <ProfilePanel profile={profile} smooth={smooth} onSmoothChange={setSmooth} />
        <SizePanel unit={unit} onUnitChange={setUnit} sizeBy={sizeBy} onSizeByChange={setSizeBy}
          size={size} onSizeChange={setSize} result={result} />
        <ResultPanel result={result} error={error} pct={pctNum} unit={unit} />
      </div>
    </div>
  );
}
