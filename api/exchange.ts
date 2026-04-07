// Vercel Serverless Function — Exchange rate proxy
// Usage: GET /api/exchange?from=USD&to=KRW

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const from = url.searchParams.get('from') || 'USD';
  const to = url.searchParams.get('to') || 'KRW';

  try {
    const targetUrl = `https://api.exchangerate.host/latest?base=${from}&symbols=${to}`;
    const res = await fetch(targetUrl, {
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ rate: 1504.17, source: 'fallback' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const data = await res.json();
    const rate = data?.rates?.[to];
    return new Response(
      JSON.stringify({ rate: rate || 1504.17, source: 'exchangerate.host', date: data?.date }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  } catch {
    return new Response(
      JSON.stringify({ rate: 1504.17, source: 'fallback' }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
