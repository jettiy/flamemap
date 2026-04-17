// Vercel Serverless Function — Fear & Greed Index proxy
// Hides alternative.me API endpoint from client
// Usage: GET /api/fear-greed

export const config = {
  runtime: 'edge',
};

// Server-side only: Fear & Greed API URL — client never sees this
const FEAR_GREED_API = 'https://api.alternative.me/fng/?limit=30';

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

  try {
    const res = await fetch(FEAR_GREED_API, {
      headers: { 'User-Agent': 'FlameMap/1.0' },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      throw new Error(`Fear & Greed API returned ${res.status}`);
    }

    const data = await res.json();

    // Strip internal API details, only return what the client needs
    const current = data?.data?.[0];
    const history = (data?.data ?? []).slice(0, 30).map((item: any) => ({
      value: parseInt(item.value, 10),
      classification: item.value_classification,
      timestamp: item.timestamp,
      date: new Date(parseInt(item.timestamp, 10) * 1000).toISOString().slice(0, 10),
    }));

    return new Response(
      JSON.stringify({
        status: 'ok',
        current: current
          ? {
              value: parseInt(current.value, 10),
              classification: current.value_classification,
              timestamp: current.timestamp,
              date: new Date(parseInt(current.timestamp, 10) * 1000).toISOString().slice(0, 10),
            }
          : null,
        history,
      }),
      {
        headers: corsHeaders({
          'Cache-Control': 'public, s-maxage=600', // 10min CDN cache
        }),
      }
    );
  } catch (err) {
    // Return fallback data on error
    return new Response(
      JSON.stringify({
        status: 'ok',
        current: { value: 45, classification: 'Fear', timestamp: '', date: new Date().toISOString().slice(0, 10) },
        history: [],
        fallback: true,
      }),
      { headers: corsHeaders() }
    );
  }
}
