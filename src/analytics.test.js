import { describe, expect, it } from "vitest";
import { isLiveSite } from "./analytics.js";

describe("isLiveSite", () => {
  it("is true for a deployed site", () => {
    expect(isLiveSite("mkvug.github.io", "https:")).toBe(true);
    expect(isLiveSite("studio.example.com", "https:")).toBe(true);
  });

  it("is false for local development and preview", () => {
    expect(isLiveSite("localhost", "http:")).toBe(false);
    expect(isLiveSite("127.0.0.1", "http:")).toBe(false);
    expect(isLiveSite("[::1]", "http:")).toBe(false);
    expect(isLiveSite("my-laptop.local", "http:")).toBe(false);
    expect(isLiveSite("192.168.1.20", "http:")).toBe(false);
    expect(isLiveSite("10.0.0.5", "http:")).toBe(false);
  });

  it("is false for files and dev builds", () => {
    expect(isLiveSite("", "file:")).toBe(false);
    expect(isLiveSite("mkvug.github.io", "https:", true)).toBe(false);
  });
});
