import { NextResponse } from "next/server";

export async function GET() {
  const start = Date.now();
  try {
    const res = await fetch(
      "https://lingva.ml/api/v1/en/ko/hello",
      { signal: AbortSignal.timeout(8000) }
    );
    const elapsed = Date.now() - start;
    if (!res.ok) {
      return NextResponse.json({ status: res.status, elapsed, error: `HTTP ${res.status}` });
    }
    const data = await res.json();
    return NextResponse.json({ status: res.status, elapsed, data });
  } catch (err) {
    const elapsed = Date.now() - start;
    return NextResponse.json({
      error: err instanceof Error ? err.message : String(err),
      elapsed,
    });
  }
}
