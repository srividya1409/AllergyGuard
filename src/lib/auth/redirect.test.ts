import { describe, expect, it } from "vitest";
import { DEFAULT_AFTER_CONFIRM_PATH, safeNextPath } from "./redirect";

describe("safeNextPath", () => {
  it.each(["/onboarding", "/profile/edit", "/scan?mode=barcode", "/"])(
    "allows relative path %s",
    (path) => {
      expect(safeNextPath(path)).toBe(path);
    },
  );

  it.each([
    ["missing", null],
    ["undefined", undefined],
    ["empty", ""],
    ["full https URL", "https://evil.example"],
    ["full http URL", "http://evil.example/onboarding"],
    ["javascript: URL", "javascript:alert(1)"],
    ["protocol-relative //", "//evil.example"],
    ["triple slash", "///evil.example"],
    ["backslash trick", "/\\evil.example"],
    ["no leading slash", "onboarding"],
    ["tab injection", "/\t/evil.example"],
    ["newline injection", "/\nLocation: https://evil.example"],
  ])("rejects %s and falls back to /onboarding", (_label, input) => {
    expect(safeNextPath(input)).toBe(DEFAULT_AFTER_CONFIRM_PATH);
  });
});
