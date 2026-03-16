/**
 * Client-side Lingva translation (runs in browser, bypasses Vercel 403).
 * Falls back to null on failure so caller can try server API.
 */
export async function translateWithLingva(
  text: string,
  from: string,
  to: string
): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(text);
    const res = await fetch(
      `https://lingva.ml/api/v1/${from}/${to}/${encoded}`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.translation || null;
  } catch {
    return null;
  }
}
