import { describe, expect, it } from "vitest";
import { cavityVolume, capacityMl, solveScale, solveStretch, formatVolume, mlToUnit, unitToMl } from "./volume.js";

const close = (actual, expected, tol) => expect(Math.abs(actual - expected) / expected).toBeLessThan(tol);

describe("cavityVolume", () => {
  it("matches a straight-walled cylinder", () => {
    // outer radius 2, height 5, wall 0.25, floor 0.375
    const outer = [[0, 0], [2, 0], [2, 5]];
    close(cavityVolume(outer, 0.25, 0.375), Math.PI * 1.75 ** 2 * (5 - 0.375), 0.01);
  });

  it("matches a hemispherical bowl", () => {
    const R = 3, t = 0.25;
    const outer = [];
    for (let i = 0; i <= 60; i++) {
      const a = (i / 60) * (Math.PI / 2);
      outer.push([R * Math.sin(a), R * (1 - Math.cos(a))]);
    }
    close(cavityVolume(outer, t, t), (2 / 3) * Math.PI * (R - t) ** 3, 0.02);
  });

  it("is zero when the walls fill the pot", () => {
    expect(cavityVolume([[0, 0], [0.2, 0], [0.2, 3]], 0.25, 0.25)).toBe(0);
  });

  it("is zero for invalid thickness", () => {
    expect(cavityVolume([[0, 0], [2, 0], [2, 5]], 0, 0.3)).toBe(0);
  });

  it("grows when walls get thinner", () => {
    const outer = [[0, 0], [2, 0], [2.4, 3], [2.2, 5]];
    expect(cavityVolume(outer, 0.15, 0.2)).toBeGreaterThan(cavityVolume(outer, 0.3, 0.4));
  });
});

describe("units", () => {
  it("converts cubic inches to mL", () => {
    const outer = [[0, 0], [2, 0], [2, 5]];
    close(capacityMl(outer, 0.25, 0.375, "in"), 729, 0.02);
  });

  it("round-trips fl oz", () => {
    close(mlToUnit(unitToMl(12, "floz"), "floz"), 12, 1e-9);
    expect(formatVolume(unitToMl(12, "floz"), "floz")).toBe("12.0");
  });
});

describe("solveScale", () => {
  it("finds the scale that holds a target volume", () => {
    // a mug-ish profile in pad-like units
    const prof = [[0, 0], [40, 0], [45, 10], [45, 100], [43, 110]];
    const s = solveScale(prof, 0.25, 0.375, "in", unitToMl(12, "floz"));
    const scaled = prof.map(([r, h]) => [r * s, h * s]);
    close(capacityMl(scaled, 0.25, 0.375, "in"), unitToMl(12, "floz"), 0.005);
  });

  it("returns null for a shape that cannot hold liquid", () => {
    expect(solveScale([[0, 0], [0, 10]], 0.25, 0.375, "in", 100)).toBeNull();
  });

  it("returns null without a positive target", () => {
    expect(solveScale([[0, 0], [10, 0], [10, 10]], 0.25, 0.375, "in", 0)).toBeNull();
  });
});

describe("solveStretch", () => {
  // cylinder sketch: radius 40, height 100 pad units
  const cyl = [[0, 0], [40, 0], [40, 100]];
  const wall = 0.25, floor = 0.375;
  const target = unitToMl(12, "floz");
  const targetIn3 = target / 16.387064;

  it("holds the height and finds the width", () => {
    const sy = 4 / 100; // 4 in tall
    const sx = solveStretch(cyl, { axis: "h", scale: sy }, wall, floor, "in", target);
    // closed form: V = pi (R - wall)^2 (H - floor)
    const R = wall + Math.sqrt(targetIn3 / (Math.PI * (4 - floor)));
    close(40 * sx, R, 0.01);
  });

  it("holds the width and finds the height", () => {
    const sx = 3 / 40; // 3 in across
    const sy = solveStretch(cyl, { axis: "w", scale: sx }, wall, floor, "in", target);
    const H = floor + targetIn3 / (Math.PI * (40 * sx - wall) ** 2);
    close(100 * sy, H, 0.01);
  });

  it("returns the target volume when applied", () => {
    const sy = 0.06;
    const sx = solveStretch(cyl, { axis: "h", scale: sy }, wall, floor, "in", target);
    const scaled = cyl.map(([r, h]) => [r * sx, h * sy]);
    close(capacityMl(scaled, wall, floor, "in"), target, 0.005);
  });

  it("returns null when the fixed size is thinner than the walls", () => {
    expect(solveStretch(cyl, { axis: "w", scale: 0.2 / 40 }, wall, floor, "in", target)).toBeNull();
    expect(solveStretch(cyl, { axis: "h", scale: 0.2 / 100 }, wall, floor, "in", target)).toBeNull();
  });

  it("returns null for invalid input", () => {
    expect(solveStretch(cyl, { axis: "h", scale: 0.05 }, wall, floor, "in", 0)).toBeNull();
    expect(solveStretch(cyl, { axis: "h", scale: 0 }, wall, floor, "in", target)).toBeNull();
  });
});
