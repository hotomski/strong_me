export const AVAILABLE_DATES_ARRAY = [
  // April 2026
  "2026-04-04", "2026-04-12", "2026-04-18", "2026-04-25",
  // May 2026
  "2026-05-02", "2026-05-10", "2026-05-16", "2026-05-23", "2026-05-31",
  // June 2026
  "2026-06-05", "2026-06-06", "2026-06-13", "2026-06-21", "2026-06-27",
  // July 2026
  "2026-07-04", "2026-07-11",
  // August 2026
  "2026-08-22", "2026-08-29",
  // September 2026
  "2026-09-05", "2026-09-12", "2026-09-20", "2026-09-26",
  // October 2026
  "2026-10-03", "2026-10-24",
  // November 2026
  "2026-11-01", "2026-11-07", "2026-11-14", "2026-11-21", "2026-11-28",
  // December 2026
  "2026-12-05", "2026-12-12",
];

export const AVAILABLE_DATES = new Set(AVAILABLE_DATES_ARRAY);

// Per-class time overrides — defaults to 10:30 AM if not listed
export const CLASS_TIME_OVERRIDES: Record<string, string> = {
  "2026-05-23": "1:00 PM",
  "2026-06-05": "6:30 PM",
};
