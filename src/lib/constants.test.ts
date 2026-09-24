import { describe, expect, it } from "vitest";
import { APP_NAME } from "./constants";

describe("APP_NAME", () => {
  it("is AllergyGuard", () => {
    expect(APP_NAME).toBe("AllergyGuard");
  });
});
