import { describe, it, expect } from "vitest"
import { createHmac } from "crypto"
import { createAuthRuntime, AUTH_COOKIE_NAME, type AuthHelpers } from "~aws/handlers/auth"

const SECRET = "test-secret-key-12345";

/** Helper to build a valid cookie value for testing */
const buildCookie = (data: Record<string, unknown>, secret = SECRET) => {
  const payload = Buffer.from(JSON.stringify(data), "utf-8").toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
};

describe("auth helpers", () => {

  describe("grant (no session data)", () => {
    it("should return 200 with Set-Cookie header", () => {
      const rt = createAuthRuntime(SECRET, 604800);
      const auth = rt.forRequest(undefined);
      const result = auth.grant();

      expect(result.status).toBe(200);
      expect(result.body).toEqual({ ok: true });
      expect(result.headers["set-cookie"]).toContain(`${AUTH_COOKIE_NAME}=`);
      expect(result.headers["set-cookie"]).toContain("HttpOnly");
      expect(result.headers["set-cookie"]).toContain("Secure");
      expect(result.headers["set-cookie"]).toContain("SameSite=Lax");
      expect(result.headers["set-cookie"]).toContain("Max-Age=604800");
    });

    it("should produce a valid HMAC-signed base64url payload cookie", () => {
      const rt = createAuthRuntime(SECRET, 3600);
      const auth = rt.forRequest(undefined);
      const result = auth.grant();

      const cookie = result.headers["set-cookie"]!;
      const match = cookie.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`));
      expect(match).toBeTruthy();
      const value = match![1]!;
      const [payload, sig] = value.split(".");
      expect(payload).toBeTruthy();
      expect(sig).toBeTruthy();

      // Verify the signature
      const expected = createHmac("sha256", SECRET)
        .update(payload!)
        .digest("base64url");
      expect(sig).toBe(expected);

      // Decode payload and verify exp
      const data = JSON.parse(Buffer.from(payload!, "base64url").toString("utf-8"));
      expect(data.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });

    it("should respect custom expiresIn", () => {
      const rt = createAuthRuntime(SECRET, 604800);
      const auth = rt.forRequest(undefined);
      const result = auth.grant({ expiresIn: "1h" });

      expect(result.headers["set-cookie"]).toContain("Max-Age=3600");
    });
  });

  describe("grant (with session data)", () => {
    it("should encode custom data in payload", () => {
      const rt = createAuthRuntime(SECRET, 3600);
      const auth = rt.forRequest(undefined) as AuthHelpers<{ userId: string; role: string }>;
      const result = auth.grant({ userId: "u123", role: "admin" });

      const cookie = result.headers["set-cookie"]!;
      const match = cookie.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`))!;
      const [payload] = match[1]!.split(".");

      const data = JSON.parse(Buffer.from(payload!, "base64url").toString("utf-8"));
      expect(data.userId).toBe("u123");
      expect(data.role).toBe("admin");
      expect(data.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });

    it("should accept expiresIn as second arg when data is provided", () => {
      const rt = createAuthRuntime(SECRET, 604800);
      const auth = rt.forRequest(undefined) as AuthHelpers<{ userId: string }>;
      const result = auth.grant({ userId: "u1" }, { expiresIn: "2h" });

      expect(result.headers["set-cookie"]).toContain("Max-Age=7200");
    });
  });

  describe("session", () => {
    it("should decode session from valid cookie", () => {
      const exp = Math.floor(Date.now() / 1000) + 3600;
      const cookie = buildCookie({ exp, userId: "u123", role: "admin" });

      const rt = createAuthRuntime(SECRET, 3600);
      const auth = rt.forRequest(cookie);

      expect(auth.session).toEqual({ userId: "u123", role: "admin" });
    });

    it("should return undefined for expired cookie", () => {
      const exp = Math.floor(Date.now() / 1000) - 100;
      const cookie = buildCookie({ exp, userId: "u123" });

      const rt = createAuthRuntime(SECRET, 3600);
      const auth = rt.forRequest(cookie);

      expect(auth.session).toBeUndefined();
    });

    it("should return undefined for invalid signature", () => {
      const exp = Math.floor(Date.now() / 1000) + 3600;
      const cookie = buildCookie({ exp, userId: "u123" }, "wrong-secret");

      const rt = createAuthRuntime(SECRET, 3600);
      const auth = rt.forRequest(cookie);

      expect(auth.session).toBeUndefined();
    });

    it("should return undefined when no cookie provided", () => {
      const rt = createAuthRuntime(SECRET, 3600);
      const auth = rt.forRequest(undefined);

      expect(auth.session).toBeUndefined();
    });

    it("should return undefined for cookie with only exp (no custom data)", () => {
      const exp = Math.floor(Date.now() / 1000) + 3600;
      const cookie = buildCookie({ exp });

      const rt = createAuthRuntime(SECRET, 3600);
      const auth = rt.forRequest(cookie);

      expect(auth.session).toBeUndefined();
    });
  });

  describe("revoke", () => {
    it("should return 200 with Max-Age=0 to clear cookie", () => {
      const rt = createAuthRuntime(SECRET, 604800);
      const auth = rt.forRequest(undefined);
      const result = auth.revoke();

      expect(result.status).toBe(200);
      expect(result.body).toEqual({ ok: true });
      expect(result.headers["set-cookie"]).toContain(`${AUTH_COOKIE_NAME}=`);
      expect(result.headers["set-cookie"]).toContain("Max-Age=0");
    });
  });

});
