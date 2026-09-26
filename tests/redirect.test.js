import { describe, it, expect, afterEach } from "vitest";
import { safeNextPath, readNextParam } from "../lib/redirect.js";

describe("safeNextPath", () => {
  it("keeps same-origin absolute paths", () => {
    expect(safeNextPath("/messages/5")).toBe("/messages/5");
    expect(safeNextPath("/messages/5?tab=unread")).toBe("/messages/5?tab=unread");
    expect(safeNextPath("/")).toBe("/");
    expect(safeNextPath("/create/opportunity/12")).toBe("/create/opportunity/12");
  });

  it("falls back when no candidate is given", () => {
    expect(safeNextPath(undefined)).toBe("/");
    expect(safeNextPath(null)).toBe("/");
    expect(safeNextPath("")).toBe("/");
    expect(safeNextPath(42)).toBe("/");
    expect(safeNextPath({})).toBe("/");
  });

  it("rejects absolute URLs so ?next= cannot become an open redirect", () => {
    expect(safeNextPath("https://evil.example")).toBe("/");
    expect(safeNextPath("http://evil.example/steal")).toBe("/");
    expect(safeNextPath("HTTPS://EVIL.EXAMPLE")).toBe("/");
  });

  it("rejects protocol-relative URLs", () => {
    expect(safeNextPath("//evil.example")).toBe("/");
    expect(safeNextPath("//evil.example/path")).toBe("/");
  });

  it("rejects the backslash variant browsers normalise to //", () => {
    expect(safeNextPath("/\\evil.example")).toBe("/");
    expect(safeNextPath("/\\/evil.example")).toBe("/");
  });

  it("rejects relative and non-http schemes", () => {
    expect(safeNextPath("messages/5")).toBe("/");
    expect(safeNextPath("javascript:alert(1)")).toBe("/");
    expect(safeNextPath("data:text/html,<script>alert(1)</script>")).toBe("/");
  });

  it("honours a caller-supplied fallback", () => {
    expect(safeNextPath("https://evil.example", "/profile")).toBe("/profile");
    expect(safeNextPath(undefined, "/profile")).toBe("/profile");
  });
});

describe("readNextParam", () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    if (originalWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = originalWindow;
    }
  });

  function stubLocation(search) {
    globalThis.window = { location: { search } };
  }

  it("returns / when there is no query string", () => {
    stubLocation("");
    expect(readNextParam()).toBe("/");
  });

  it("returns / when next is absent", () => {
    stubLocation("?other=1");
    expect(readNextParam()).toBe("/");
  });

  it("reads a valid same-origin next", () => {
    stubLocation("?next=%2Fmessages%2F5");
    expect(readNextParam()).toBe("/messages/5");
  });

  it("sanitises a hand-crafted off-site next that bypassed the proxy", () => {
    stubLocation("?next=https%3A%2F%2Fevil.example");
    expect(readNextParam()).toBe("/");

    stubLocation("?next=%2F%2Fevil.example");
    expect(readNextParam()).toBe("/");
  });

  it("returns / when there is no window (server render)", () => {
    delete globalThis.window;
    expect(readNextParam()).toBe("/");
  });
});
