// Drawing pad size (SVG viewBox units) and the wheel axis the profile mirrors around.
export const VW = 360;
export const VH = 320;
export const AX = VW / 2;
export const EDGE = 10;

// Starting profiles, as [x, y] pad points from the base up (right half only).
export const SHAPES = {
  Vase:     [[180,282],[215,280],[250,244],[263,184],[238,124],[208,92],[213,48]],
  Bowl:     [[180,262],[212,260],[252,236],[286,184],[303,112]],
  Cylinder: [[180,278],[222,278],[233,262],[234,190],[234,70],[230,58]],
};

export const SHRINKAGE_PRESETS = [
  { name: "Earthenware", pct: 6 },
  { name: "Stoneware", pct: 12 },
  { name: "Porcelain", pct: 15 },
];

export const UNITS = ["in", "cm"];
