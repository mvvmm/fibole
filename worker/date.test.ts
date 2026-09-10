import { describe, it, expect } from "vitest";
import { addDaysISO } from "./date";

describe("addDaysISO", () => {
  it("adds days within a month", () => {
    expect(addDaysISO("2026-09-09", 1)).toBe("2026-09-10");
  });
  it("rolls over a month boundary", () => {
    expect(addDaysISO("2026-09-30", 1)).toBe("2026-10-01");
  });
  it("rolls over a year boundary", () => {
    expect(addDaysISO("2026-12-31", 1)).toBe("2027-01-01");
  });
  it("supports negative offsets", () => {
    expect(addDaysISO("2026-09-01", -1)).toBe("2026-08-31");
  });
  it("supports multi-day offsets", () => {
    expect(addDaysISO("2026-09-09", 7)).toBe("2026-09-16");
  });
});
