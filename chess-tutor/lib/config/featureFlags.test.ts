import { afterEach, describe, expect, it } from "vitest";
import { isAiEnabled, isAnalysisEnabled, isImportsEnabled } from "./featureFlags";

const FLAGS = [
  ["AI_ENABLED", isAiEnabled],
  ["ANALYSIS_ENABLED", isAnalysisEnabled],
  ["IMPORTS_ENABLED", isImportsEnabled],
] as const;

afterEach(() => {
  for (const [key] of FLAGS) delete process.env[key];
});

describe.each(FLAGS)("%s", (key, fn) => {
  it("defaults to enabled when unset", () => {
    delete process.env[key];
    expect(fn()).toBe(true);
  });

  it('is disabled when set to "false"', () => {
    process.env[key] = "false";
    expect(fn()).toBe(false);
  });

  it("is disabled case-insensitively", () => {
    process.env[key] = "FALSE";
    expect(fn()).toBe(false);
  });

  it("is enabled for any other value", () => {
    process.env[key] = "true";
    expect(fn()).toBe(true);
    process.env[key] = "0";
    expect(fn()).toBe(true);
  });
});
