// Vercel Serverless Function — RSS News proxy
// Hides rss2json.com API endpoint AND RSS feed URLs from client
// Usage: GET /api/news?feed_id=reuters_business&count=30
//        GET /api/news?feed_id=all (fetches all feeds)
//        GET /api/news?feed_id=financial (fetches Bloomberg + Reuters + CNBC)
//        GET /api/news?rss_url=<encoded URL> (legacy, whitelisted only)

export const config = {
  runtime: 'edge',
};

// Server-side only: RSS feed mapping — client never sees these URLs
const FEED_MAP: Record<string, { url: string; name: string; category: string }> = {
  // ── 주요 경제 통신사 (뉴스룸 메인) ──
  reuters_business:   { url: 'https://feeds.reuters.com/reuters/businessNews',     name: 'Reuters',          category: 'financial' },
  reuters_world:      { url: 'https://feeds.reuters.com/reuters/worldNews',        name: 'Reuters World',    category: 'financial' },
  reuters_energy:     { url: 'https://feeds.reuters.com/reuters/energyNews',       name: 'Reuters Energy',   category: 'energy' },
  bloomberg:          { url: 'https://feeds.bloomberg.com/markets/news.rss',       name: 'Bloomberg',        category: 'financial' },
  bloomberg_energy:   { url: 'https://feeds.bloomberg.com/energy/news.rss',        name: 'Bloomberg Energy', category: 'energy' },
  bloomberg_economy:  { url: 'https://feeds.bloomberg.com/economics/news.rss',     name: 'Bloomberg Econ',   category: 'economy' },
  cnbc_world:         { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100727362', name: 'CNBC World', category: 'financial' },
  wsj_markets:        { url: 'https://feeds.content.dowjones.io/public/rss/markets_main', name: 'WSJ Markets', category: 'financial' },
  ft_markets:         { url: 'https://www.ft.com/rss/home',                        name: 'FT',               category: 'financial' },

  // ── 중동/에너지 특화 ──
  bbc_business:       { url: 'http://feeds.bbci.co.uk/news/business/rss.xml',     name: 'BBC Business',     category: 'financial' },
  bbc_middle_east:    { url: 'http://feeds.bbci.co.uk/news/world/middle_east/rss.xml', name: 'BBC Middle East', category: 'energy' },
  aljazeera:          { url: 'https://www.aljazeera.com/xml/rss/all.xml',          name: 'Al Jazeera',       category: 'energy' },
};

// Category-based feed groups for newsroom
const CATEGORY_MAP: Record<string, string[]> = {
  financial: ['reuters_business', 'bloomberg', 'cnbc_world', 'wsj_markets', 'ft_markets'],
  energy: ['reuters_energy', 'bloomberg_energy', 'reuters_world', 'bbc_middle_east', 'aljazeera'],
  economy: ['bloomberg_economy', 'reuters_business', 'wsj_markets', 'ft_markets'],
  all: Object.keys(FEED_MAP),
};

// Allowed RSS feeds (whitelist — prevents arbitrary URL abuse)
const ALLOWED_FEEDS = Object.values(FEED_MAP).map(f => f.url);

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
  const feedId = url.searchParams.get('feed_id');
  const count = Math.min(parseInt(url.searchParams.get('count') || '20', 10), 50);

  // Determine which feeds to fetch based on feed_id
  let feedsToFetch: { url: string; name: string; id: string; category: string }[] = [];

  if (feedId === 'all' || !feedId) {
    // Fetch all feeds
    feedsToFetch = Object.entries(FEED_MAP).map(([id, feed]) => ({ ...feed, id }));
  } else if (CATEGORY_MAP[feedId]) {
    // Fetch by category group
    feedsToFetch = CATEGORY_MAP[feedId]
      .map(id => FEED_MAP[id] ? { ...FEED_MAP[id], id } : null)
      .filter(Boolean) as typeof feedsToFetch;
  } else if (FEED_MAP[feedId]) {
    feedsToFetch = [{ ...FEED_MAP[feedId], id: feedId }];
  } else {
    // Legacy: support rss_url parameter for backward compat
    const rssUrl = url.searchParams.get('rss_url');
    if (!rssUrl) {
      return new Response(
        JSON.stringify({ error: 'feed_id or rss_url parameter required' }),
        { status: 400, headers: corsHeaders() }
      );
    }
    // Whitelist check — only allow known RSS feeds
    if (!ALLOWED_FEEDS.some((feed) => rssUrl.startsWith(feed))) {
      return new Response(
        JSON.stringify({ error: 'RSS feed not allowed' }),
        { status: 403, headers: corsHeaders() }
      );
    }
    // Find the feed name from the map
    const matchedEntry = Object.entries(FEED_MAP).find(([, f]) => rssUrl.startsWith(f.url));
    feedsToFetch = [{ url: rssUrl, name: matchedEntry?.[1].name ?? 'RSS', id: matchedEntry?.[0] ?? 'unknown', category: matchedEntry?.[1].category ?? 'general' }];
  }

  try {
    // Fetch all requested feeds in parallel
    const results = await Promise.allSettled(
      feedsToFetch.map(async (feed) => {
        const apiTarget = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&count=${count}`;
        const res = await fetch(apiTarget, {
          headers: { 'User-Agent': 'FlameMap/1.0' },
          signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) {
          throw new Error(`rss2json returned ${res.status}`);
        }

        const data = await res.json();

        // Strip internal API details, only return what the client needs
        const items = (data.items ?? []).map((item: any) => ({
          title: item.title ?? '',
          description: item.description ?? '',
          link: item.link ?? '',
          pubDate: item.pubDate ?? '',
          source: feed.name,
          category: feed.category,
        }));

        return items;
      })
    );

    // Merge all successful results
    const allItems: any[] = [];
    for (const r of results) {
      if (r.status === 'fulfilled') {
        allItems.push(...r.value);
      }
    }

    return new Response(
      JSON.stringify({ status: 'ok', items: allItems }),
      {
        headers: corsHeaders({
          'Cache-Control': 'public, s-maxage=300', // 5min CDN cache
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
