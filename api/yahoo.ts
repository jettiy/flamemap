// Vercel Serverless Function — CORS proxy for Yahoo Finance API
// Usage: GET /api/yahoo?symbol=BZ=F&range=5d&interval=1d

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const symbol = url.searchParams.get('symbol');
  const range = url.searchParams.get('range') || '5d';
  const interval = url.searchParams.get('interval') || '1d';

  if (!symbol) {
    return new Response(JSON.stringify({ error: 'symbol parameter required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  try {
    const targetUrl = `https://query1.finance.yahoo.com/v8/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;
    const res = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Yahoo API returned ${res.status}` }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const data = await res.json();
    const closes: (number | null)[] = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? [];
    const valid = closes.filter((c): c is number => c !== null);

    if (valid.length < 2) {
      return new Response(JSON.stringify({ error: 'insufficient data' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const price = Math.round(valid[valid.length - 1] * 100) / 100;
    const prev = valid[valid.length - 2];
    const change = Math.round(((price - prev) / prev) * 10000) / 100;

    return new Response(
      JSON.stringify({ symbol, price, change, timestamp: new Date().toISOString() }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
