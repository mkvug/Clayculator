import { useEffect, useMemo, useState } from "react";
import ShrinkagePanel from "./components/ShrinkagePanel.jsx";
import ProfilePanel from "./components/ProfilePanel.jsx";
import SizePanel from "./components/SizePanel.jsx";
import ResultPanel from "./components/ResultPanel.jsx";
import useProfile from "./hooks/useProfile.js";
import { buildProfile, computeThrow, scaleForSize } from "./lib/calc.js";
import { MM_PER } from "./lib/constants.js";
import { round } from "./lib/geometry.js";
import { VOLUME_UNITS, capacityMl, mlToUnit, solveScale, solveStretch, unitToMl } from "./lib/volume.js";
import { CUSTOM, contrastText } from "./config.js";

const thickText = (mm, unit) => String(round(mm / MM_PER[unit], 2));
const convertThick = (text, from, to) => {
  const n = parseFloat(text);
  return n > 0 ? String(round((n * MM_PER[from]) / MM_PER[to], 2)) : text;
};
const volumeDigits = (id) => VOLUME_UNITS.find((u) => u.id === id).digits;

// The calculator students see. `config` must already be normalized (see normalizeConfig).
export default function Calculator({ config }) {
  const { clays, allowCustom } = config;
  const volumeOn = config.showVolume || config.volumeSizing;

  const [clayId, setClayId] = useState(config.defaultClay);
  const [customPct, setCustomPct] = useState("12");
  const [unit, setUnit] = useState(config.unit);
  const [smooth, setSmooth] = useState(true);
  const [sizeBy, setSizeBy] = useState("h");
  const [size, setSize] = useState("8");
  const [volUnit, setVolUnit] = useState(config.volumeUnit);
  const [matchVolume, setMatchVolume] = useState(false);
  const [volTarget, setVolTarget] = useState("");
  const [wall, setWall] = useState(thickText(config.wallMm, config.unit));
  const [floor, setFloor] = useState(thickText(config.floorMm, config.unit));
  const profile = useProfile();

  // Follow configurator changes to these settings (the live preview).
  useEffect(() => setClayId(config.defaultClay), [config.defaultClay]);
  useEffect(() => setVolUnit(config.volumeUnit), [config.volumeUnit]);
  useEffect(() => {
    setUnit(config.unit);
    setWall(thickText(config.wallMm, config.unit));
    setFloor(thickText(config.floorMm, config.unit));
  }, [config.unit, config.wallMm, config.floorMm]);
  useEffect(() => {
    if (!config.volumeSizing && sizeBy === "v") { setSizeBy("h"); setSize("8"); }
    if (!config.volumeSizing) setMatchVolume(false);
  }, [config.volumeSizing, sizeBy]);

  const isCustom = clays.length === 0 || (clayId === CUSTOM && allowCustom);
  const clay = isCustom
    ? null
    : clays.find((c) => c.id === clayId) || clays.find((c) => c.id === config.defaultClay) || clays[0];

  const onClayChange = (id) => {
    if (id === CUSTOM && clay) setCustomPct(String(clay.shrinkage));
    setClayId(id);
  };

  const changeUnit = (next) => {
    setWall((w) => convertThick(w, unit, next));
    setFloor((f) => convertThick(f, unit, next));
    setUnit(next);
  };

  const pctNum = isCustom ? parseFloat(customPct) : clay.shrinkage;
  const sizeNum = parseFloat(size);
  const wallNum = parseFloat(wall);
  const floorNum = parseFloat(floor);
  const pctOk = pctNum >= 0 && pctNum < 100;
  const sizeOk = sizeNum > 0;
  const thickOk = wallNum > 0 && floorNum > 0;
  const byVolume = sizeBy === "v";

  const built = useMemo(
    () => buildProfile(profile.pts, smooth, byVolume ? "h" : sizeBy),
    [profile.pts, smooth, sizeBy, byVolume]
  );

  const volNum = parseFloat(volTarget);
  const fit = !byVolume && matchVolume && config.volumeSizing;

  // Scales (final units per pad unit) across and up. A volume target needs a numerical search, so memoize.
  const scales = useMemo(() => {
    if (!built || !sizeOk) return null;
    if (byVolume) {
      if (!thickOk) return null;
      const s = solveScale(built.prof, wallNum, floorNum, unit, unitToMl(sizeNum, volUnit));
      return s ? { sx: s, sy: s } : null;
    }
    if (fit) {
      if (!thickOk || !(volNum > 0)) return null;
      const ml = unitToMl(volNum, volUnit);
      if (sizeBy === "h") {
        const sy = sizeNum / built.Hraw;
        const sx = solveStretch(built.prof, { axis: "h", scale: sy }, wallNum, floorNum, unit, ml);
        return sx ? { sx, sy } : null;
      }
      const sx = sizeNum / built.Wraw;
      const sy = solveStretch(built.prof, { axis: "w", scale: sx }, wallNum, floorNum, unit, ml);
      return sy ? { sx, sy } : null;
    }
    const s = scaleForSize(built, sizeNum);
    return { sx: s, sy: s };
  }, [built, sizeOk, byVolume, fit, sizeBy, sizeNum, thickOk, wallNum, floorNum, unit, volUnit, volNum]);

  const result = built && pctOk && scales ? computeThrow(built, pctNum, scales.sx, scales.sy) : null;

  const volumeMl = useMemo(
    () => (result && volumeOn && thickOk ? capacityMl(result.fired, wallNum, floorNum, unit) : null),
    [result, volumeOn, thickOk, wallNum, floorNum, unit]
  );
  const showVolume = volumeMl !== null && (config.showVolume || byVolume || fit);

  // Keep the same shape when switching what to size by: carry its current size into the new field.
  const changeSizeBy = (next) => {
    if (result) {
      if (next === "h") setSize(String(round(result.Hf, 2)));
      else if (next === "w") setSize(String(round(result.Wf, 2)));
      else if (volumeMl !== null) setSize(String(round(mlToUnit(volumeMl, volUnit), volumeDigits(volUnit))));
    }
    setSizeBy(next);
  };

  const changeVolUnit = (next) => {
    if (byVolume && sizeOk) setSize(String(round(mlToUnit(unitToMl(sizeNum, volUnit), next), volumeDigits(next))));
    if (matchVolume && volNum > 0) setVolTarget(String(round(mlToUnit(unitToMl(volNum, volUnit), next), volumeDigits(next))));
    setVolUnit(next);
  };

  // Start the target at what the sketch holds now, so ticking the box doesn't change the shape.
  const changeMatch = (on) => {
    if (on && volumeMl !== null) setVolTarget(String(round(mlToUnit(volumeMl, volUnit), volumeDigits(volUnit))));
    setMatchVolume(on);
  };

  let error = null;
  if (!result) {
    if (profile.pts.length < 2) error = "Add at least two points to the profile.";
    else if (!pctOk) error = "Shrinkage must be at least 0 and under 100%.";
    else if (!sizeOk) error = "Enter a final size greater than zero.";
    else if ((byVolume || fit) && !thickOk) error = "Enter a wall and floor thickness greater than zero.";
    else if (fit && !(volNum > 0)) error = "Enter a target volume greater than zero.";
    else if (byVolume && built) error = "This shape can't hold liquid at any size. Give it a floor and an open top.";
    else if (fit && built) error = `This shape can't hold liquid at that ${sizeBy === "h" ? "height" : "width"} with the current wall and floor thickness. Try a larger size or thinner walls.`;
    else error = `The drawn shape has no ${sizeBy === "h" ? "height" : "width"}. Spread the points out, or switch what you size by.`;
  }

  const accentStyle = config.accent
    ? { "--accent": config.accent, "--accent-fg": contrastText(config.accent) }
    : undefined;

  const volumeProps = volumeOn
    ? {
        sizing: config.volumeSizing,
        unit: volUnit,
        onUnitChange: changeVolUnit,
        wall,
        floor,
        onWallChange: setWall,
        onFloorChange: setFloor,
        match: matchVolume,
        onMatchChange: changeMatch,
        target: volTarget,
        onTargetChange: setVolTarget,
        stretch: fit && result ? { ratio: sizeBy === "h" ? scales.sx / scales.sy : scales.sy / scales.sx, axis: sizeBy } : null,
      }
    : null;

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
        <SizePanel unit={unit} onUnitChange={changeUnit} sizeBy={sizeBy} onSizeByChange={changeSizeBy}
          size={size} onSizeChange={setSize} result={result} volume={volumeProps} />
        <ResultPanel result={result} error={error} pct={pctNum} unit={unit}
          volume={showVolume ? { ml: volumeMl, unit: volUnit, wall: wallNum, floor: floorNum } : null} />
      </div>
    </div>
  );
}
