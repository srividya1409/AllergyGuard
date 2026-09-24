import { describe, expect, it } from "vitest";
import {
  GENERIC_SIGN_UP_ERROR,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  SIGN_UP_ERROR_CODES,
  isAccountExistsError,
  signUpErrorMessage,
  validateEmail,
  validatePassword,
} from "./validation";

describe("validateEmail", () => {
  it.each(["name@example.com", "  a.b+tag@mail.co.uk  "])(
    "accepts %s",
    (email) => {
      expect(validateEmail(email)).toBeNull();
    },
  );

  it.each(["", "   ", "name", "name@", "@example.com", "name@example", "a b@example.com"])(
    "rejects %j",
    (email) => {
      expect(validateEmail(email)).toEqual(expect.any(String));
    },
  );
});

describe("validatePassword", () => {
  it("rejects an empty password", () => {
    expect(validatePassword("")).toEqual(expect.any(String));
  });

  it("rejects a password one character too short", () => {
    expect(validatePassword("a".repeat(PASSWORD_MIN_LENGTH - 1))).toMatch(
      String(PASSWORD_MIN_LENGTH),
    );
  });

  it("accepts a password at the minimum and maximum length", () => {
    expect(validatePassword("a".repeat(PASSWORD_MIN_LENGTH))).toBeNull();
    expect(validatePassword("a".repeat(PASSWORD_MAX_LENGTH))).toBeNull();
  });

  it("rejects a password over the bcrypt limit", () => {
    expect(validatePassword("a".repeat(PASSWORD_MAX_LENGTH + 1))).toEqual(
      expect.any(String),
    );
  });
});

describe("isAccountExistsError", () => {
  it("recognises the codes Supabase uses for an existing account", () => {
    expect(isAccountExistsError("user_already_exists")).toBe(true);
    expect(isAccountExistsError("email_exists")).toBe(true);
  });

  it("is false for other codes and missing codes", () => {
    expect(isAccountExistsError("weak_password")).toBe(false);
    expect(isAccountExistsError(undefined)).toBe(false);
  });
});

describe("signUpErrorMessage", () => {
  it.each(SIGN_UP_ERROR_CODES)("gives %s its own specific message", (code) => {
    const message = signUpErrorMessage({ code, status: 400 });
    expect(message.trim()).not.toBe("");
    expect(message).not.toBe(GENERIC_SIGN_UP_ERROR);
  });

  it("gives every known code a different message", () => {
    const messages = SIGN_UP_ERROR_CODES.map((code) =>
      signUpErrorMessage({ code, status: 400 }),
    );
    expect(new Set(messages).size).toBe(messages.length);
  });

  it("tells the user to check their connection on a network failure", () => {
    const message = signUpErrorMessage({ status: 0 });
    expect(message).not.toBe(GENERIC_SIGN_UP_ERROR);
    expect(message.toLowerCase()).toMatch(/connection|internet|offline|network/);
  });

  it("mentions the minimum length for a weak password", () => {
    expect(signUpErrorMessage({ code: "weak_password", status: 422 })).toMatch(
      String(PASSWORD_MIN_LENGTH),
    );
  });

  it("falls back to the generic message for unknown or missing codes", () => {
    expect(signUpErrorMessage({ code: "something_new", status: 500 })).toBe(
      GENERIC_SIGN_UP_ERROR,
    );
    expect(signUpErrorMessage({})).toBe(GENERIC_SIGN_UP_ERROR);
  });

  it("never reveals whether an email is registered", () => {
    const all = [
      ...SIGN_UP_ERROR_CODES.map((code) => signUpErrorMessage({ code })),
      signUpErrorMessage({ status: 0 }),
      signUpErrorMessage({}),
    ];
    for (const message of all) {
      expect(message.toLowerCase()).not.toMatch(
        /already (registered|exists|in use)|account exists/,
      );
    }
  });
});
