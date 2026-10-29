import { useEffect, useMemo, useState } from "react";
import ShrinkagePanel from "./components/ShrinkagePanel.jsx";
import ProfilePanel from "./components/ProfilePanel.jsx";
import SizePanel from "./components/SizePanel.jsx";
import ResultPanel from "./components/ResultPanel.jsx";
import useProfile from "./hooks/useProfile.js";
import { buildProfile, computeThrow, scaleForSize } from "./lib/calc.js";
import { MM_PER } from "./lib/constants.js";
import { round } from "./lib/geometry.js";
import { VOLUME_UNITS, capacityMl, mlToUnit, solveScale, unitToMl } from "./lib/volume.js";
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

  // Scale (final units per pad unit). For a volume target this is a numerical search, so memoize it.
  const scale = useMemo(() => {
    if (!built || !sizeOk) return null;
    if (!byVolume) return scaleForSize(built, sizeNum);
    if (!thickOk) return null;
    return solveScale(built.prof, wallNum, floorNum, unit, unitToMl(sizeNum, volUnit));
  }, [built, sizeOk, byVolume, sizeNum, thickOk, wallNum, floorNum, unit, volUnit]);

  const result = built && pctOk && scale ? computeThrow(built, pctNum, scale) : null;

  const volumeMl = useMemo(
    () => (result && volumeOn && thickOk ? capacityMl(result.fired, wallNum, floorNum, unit) : null),
    [result, volumeOn, thickOk, wallNum, floorNum, unit]
  );
  const showVolume = volumeMl !== null && (config.showVolume || byVolume);

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
    setVolUnit(next);
  };

  let error = null;
  if (!result) {
    if (profile.pts.length < 2) error = "Add at least two points to the profile.";
    else if (!pctOk) error = "Shrinkage must be at least 0 and under 100%.";
    else if (!sizeOk) error = "Enter a final size greater than zero.";
    else if (byVolume && !thickOk) error = "Enter a wall and floor thickness greater than zero.";
    else if (byVolume && built) error = "This shape can't hold liquid at any size. Give it a floor and an open top.";
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
