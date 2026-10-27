import { useMemo, useState } from "react";
import ShrinkagePanel from "./components/ShrinkagePanel.jsx";
import ProfilePanel from "./components/ProfilePanel.jsx";
import SizePanel from "./components/SizePanel.jsx";
import ResultPanel from "./components/ResultPanel.jsx";
import useProfile from "./hooks/useProfile.js";
import { buildProfile, computeThrow } from "./lib/calc.js";

export default function App() {
  const [pct, setPct] = useState("12");
  const [unit, setUnit] = useState("in");
  const [smooth, setSmooth] = useState(true);
  const [sizeBy, setSizeBy] = useState("h");
  const [size, setSize] = useState("8");
  const profile = useProfile();

  const pctNum = parseFloat(pct);
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

  return (
    <div className="wrap">
      <header>
        <h1>Throwing Size Calculator</h1>
        <p className="lede">
          Sketch half of your piece, set the clay's shrinkage and the final size, and get the dimensions to throw at.
        </p>
      </header>
      <ShrinkagePanel pct={pct} onChange={setPct} />
      <ProfilePanel profile={profile} smooth={smooth} onSmoothChange={setSmooth} />
      <SizePanel unit={unit} onUnitChange={setUnit} sizeBy={sizeBy} onSizeByChange={setSizeBy}
        size={size} onSizeChange={setSize} result={result} />
      <ResultPanel result={result} error={error} pct={pctNum} unit={unit} />
    </div>
  );
}
