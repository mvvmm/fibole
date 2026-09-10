/** Today's calendar date in the app's canonical timezone, as "YYYY-MM-DD". */
export function todayChicago(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Chicago" });
}

/** Adds `days` (may be negative) to a "YYYY-MM-DD" date, returning "YYYY-MM-DD". */
export function addDaysISO(dateISO: string, days: number): string {
  const [year, month, day] = dateISO.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
