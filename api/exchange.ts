// Vercel Serverless Function — Exchange rate proxy
// Hides exchangerate.host API endpoint from client
// Usage: GET /api/exchange?from=USD&to=KRW

export const config = {
  runtime: 'edge',
};

// Whitelist: only allow known currency pairs
const ALLOWED_PAIRS: Record<string, string[]> = {
  USD: ['KRW', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'AED', 'SAR', 'RUB', 'BRL', 'CAD', 'AUD'],
  EUR: ['KRW', 'USD'],
};

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
  const from = (url.searchParams.get('from') || 'USD').toUpperCase();
  const to = (url.searchParams.get('to') || 'KRW').toUpperCase();

  // Pair whitelist check
  if (!ALLOWED_PAIRS[from]?.includes(to)) {
    // Return fallback instead of error for better UX
    return new Response(
      JSON.stringify({ rate: 1504.17, source: 'fallback', pair: `${from}/${to}` }),
      { headers: corsHeaders({ 'Cache-Control': 'public, s-maxage=3600' }) }
    );
  }

  try {
    const targetUrl = `https://api.exchangerate.host/latest?base=${from}&symbols=${to}`;
    const res = await fetch(targetUrl, {
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ rate: 1504.17, source: 'fallback' }),
        { headers: corsHeaders() }
      );
    }

    const data = await res.json();
    const rate = data?.rates?.[to];
    return new Response(
      JSON.stringify({ rate: rate || 1504.17, source: 'exchangerate.host', date: data?.date }),
      {
        headers: corsHeaders({
          'Cache-Control': 'public, s-maxage=900', // 15min CDN cache
        }),
      }
    );
  } catch {
    return new Response(
      JSON.stringify({ rate: 1504.17, source: 'fallback' }),
      { headers: corsHeaders() }
    );
  }
}
