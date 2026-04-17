// Vercel Serverless Function — CORS proxy for Yahoo Finance API
// Hides Yahoo Finance API endpoint from client + symbol whitelist
// Usage: GET /api/yahoo?symbol=BZ=F&range=5d&interval=1d

export const config = {
  runtime: 'edge',
};

// Whitelist: only allow known commodity symbols to prevent abuse
const ALLOWED_SYMBOLS = ['BZ=F', 'CL=F', 'NG=F', 'GC=F', 'SI=F', 'HG=F'];

function corsHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
    ...extra,
  };
}

export default async function handler(request: Request) {
  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  const url = new URL(request.url);
  const symbol = url.searchParams.get('symbol');
  const range = url.searchParams.get('range') || '5d';
  const interval = url.searchParams.get('interval') || '1d';

  if (!symbol) {
    return new Response(
      JSON.stringify({ error: 'symbol parameter required' }),
      { status: 400, headers: corsHeaders() }
    );
  }

  // Symbol whitelist check
  if (!ALLOWED_SYMBOLS.includes(symbol)) {
    return new Response(
      JSON.stringify({ error: 'symbol not allowed' }),
      { status: 403, headers: corsHeaders() }
    );
  }

  try {
    const targetUrl = `https://query1.finance.yahoo.com/v8/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;
    const res = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `Yahoo API returned ${res.status}` }),
        { status: res.status, headers: corsHeaders() }
      );
    }

    const data = await res.json();
    const closes: (number | null)[] = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? [];
    const valid = closes.filter((c): c is number => c !== null);

    if (valid.length < 2) {
      return new Response(
        JSON.stringify({ error: 'insufficient data' }),
        { status: 404, headers: corsHeaders() }
      );
    }

    const price = Math.round(valid[valid.length - 1] * 100) / 100;
    const prev = valid[valid.length - 2];
    const change = Math.round(((price - prev) / prev) * 10000) / 100;

    return new Response(
      JSON.stringify({ symbol, price, change, timestamp: new Date().toISOString() }),
      {
        headers: corsHeaders({
          'Cache-Control': 'public, s-maxage=60', // 1min CDN cache
        }),
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'unknown error' }),
      { status: 500, headers: corsHeaders() }
    );
  }
}
