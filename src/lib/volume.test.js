import { describe, expect, it } from "vitest";
import { cavityVolume, capacityMl, solveScale, formatVolume, mlToUnit, unitToMl } from "./volume.js";

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
