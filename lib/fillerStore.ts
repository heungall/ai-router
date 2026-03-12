const STORAGE_KEY = "ai-router-fillers";

// Ordered longest-first so multi-word phrases match before their substrings.
export const DEFAULT_FILLERS: string[] = [
  "알려줄 수 있어",
  "설명해줄 수 있어",
  "해줄 수 있어",
  "봐줄 수 있어",
  "것 같아",
  "같은데",
  "느낌인데",
  "좀 알려줘",
  "좀 봐줘",
  "봐줄래",
  "해줄래",
  "부탁드려",
  "부탁해",
  "혹시",
  "그냥",
  "약간",
  "좀",
];

export function loadFillers(): string[] {
  if (typeof window === "undefined") return DEFAULT_FILLERS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as string[]) : DEFAULT_FILLERS;
  } catch {
    return DEFAULT_FILLERS;
  }
}

export function saveFillers(fillers: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fillers));
}

export function resetFillers(): void {
  localStorage.removeItem(STORAGE_KEY);
}
