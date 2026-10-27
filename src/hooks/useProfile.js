import { useState } from "react";
import { SHAPES } from "../lib/constants.js";

// Drawn profile points with undo history and a selected point.
export default function useProfile() {
  const [pts, setPts] = useState(SHAPES.Vase);
  const [hist, setHist] = useState([]);
  const [sel, setSel] = useState(null);

  const pushHist = () => setHist((h) => [...h.slice(-49), pts]);

  const load = (next) => {
    pushHist();
    setPts(next);
    setSel(null);
  };

  const undo = () => {
    if (!hist.length) return;
    setPts(hist[hist.length - 1]);
    setHist(hist.slice(0, -1));
    setSel(null);
  };

  const removeSelected = () => {
    if (sel === null) return;
    pushHist();
    setPts(pts.filter((_, j) => j !== sel));
    setSel(null);
  };

  return { pts, setPts, sel, setSel, pushHist, load, undo, removeSelected, canUndo: hist.length > 0 };
}
