#!/usr/bin/env python3
"""
FlameMap Live Data Updater
6시간마다 실행: 원자재 가격 + 이란-이스라엘 전쟁 뉴스 수집 → live-data.json 업데이트
"""

import json
import re
import subprocess
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone, timedelta
from pathlib import Path

KST = timezone(timedelta(hours=9))
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "public" / "live-data.json"

# ─── 기존 데이터 로드 (폴백용) ─────────────────────────────
def load_existing() -> dict:
    try:
        return json.loads(OUTPUT_PATH.read_text())
    except Exception:
        return {}

# ─── 원자재 가격: 네이버 금융 스크래핑 ──────────────────────
def fetch_market_prices_naver() -> dict | None:
    """네이버 금융 국제 원자재 페이지에서 브렌트유/WTI/천연가스 가격 파싱"""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": "ko-KR,ko;q=0.9",
        "Referer": "https://finance.naver.com/",
    }
    urls = {
        "brent": "https://finance.naver.com/marketindex/worldDailyQuote.naver?marketindexCd=OIL_CL&fdtc=2",
        "wti": "https://finance.naver.com/marketindex/worldDailyQuote.naver?marketindexCd=OIL_CL&fdtc=2",
    }
    # 심플하게 네이버 국제시세 페이지
    url = "https://finance.naver.com/marketindex/?tabSel=oil"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as r:
            html = r.read().decode("utf-8", errors="ignore")

        # 브렌트유 파싱 (네이버 패턴)
        brent_match = re.search(r'브렌트유[^>]*>.*?(\d+[\.,]\d+)', html, re.DOTALL)
        wti_match = re.search(r'WTI[^>]*>.*?(\d+[\.,]\d+)', html, re.DOTALL)
        ng_match = re.search(r'천연가스[^>]*>.*?(\d+[\.,]\d+)', html, re.DOTALL)

        result = {}
        if brent_match:
            result["brent"] = float(brent_match.group(1).replace(",", ""))
        if wti_match:
            result["wti"] = float(wti_match.group(1).replace(",", ""))
        if ng_match:
            result["naturalGas"] = float(ng_match.group(1).replace(",", ""))

        return result if result else None
    except Exception as e:
        print(f"[네이버 파싱 실패] {e}")
        return None

# ─── 원자재 가격: Yahoo Finance 비공식 API ────────────────────
def fetch_yahoo_price(symbol: str) -> tuple[float | None, float | None]:
    """(price, change_pct) 반환"""
    url = f"https://query1.finance.yahoo.com/v8/chart/{symbol}?interval=1d&range=5d"
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=8) as r:
            data = json.loads(r.read())
        result = data["chart"]["result"][0]
        closes = result["indicators"]["quote"][0]["close"]
        # None 제거
        closes = [c for c in closes if c is not None]
        if len(closes) < 2:
            return None, None
        price = round(closes[-1], 2)
        change = round((closes[-1] - closes[-2]) / closes[-2] * 100, 2)
        return price, change
    except Exception as e:
        print(f"[Yahoo {symbol} 실패] {e}")
        return None, None

# ─── 원자재 가격 수집 메인 ───────────────────────────────────
def collect_market_prices(existing: dict) -> dict:
    prev = existing.get("marketPrices", {})

    symbols = {
        "brent": "BZ=F",
        "wti": "CL=F",
        "naturalGas": "NG=F",
    }
    names = {
        "brent": "브렌트유",
        "wti": "WTI 원유",
        "naturalGas": "천연가스",
    }
    units = {
        "brent": "USD/배럴",
        "wti": "USD/배럴",
        "naturalGas": "USD/MMBtu",
    }
    fallbacks = {
        "brent": (115.4, 2.3),
        "wti": (111.2, 1.8),
        "naturalGas": (8.45, 3.1),
    }

    result = {}
    for key, symbol in symbols.items():
        price, change = fetch_yahoo_price(symbol)
        if price is not None:
            result[key] = {
                "price": price,
                "change": change,
                "unit": units[key],
                "nameKo": names[key],
                "source": "live",
            }
            print(f"[✓ LIVE] {names[key]}: {price} ({change:+.2f}%)")
        else:
            # 이전 데이터 있으면 재사용, 없으면 하드코딩 폴백
            fb_price, fb_change = fallbacks[key]
            prev_item = prev.get(key, {})
            result[key] = {
                "price": prev_item.get("price", fb_price),
                "change": prev_item.get("change", fb_change),
                "unit": units[key],
                "nameKo": names[key],
                "source": "fallback",
            }
            print(f"[✗ FALLBACK] {names[key]}: {result[key]['price']}")

    return result

# ─── 전쟁 뉴스: Al Jazeera + BBC RSS via rss2json ────────────
def fetch_war_news() -> list[dict]:
    """이란-이스라엘 전쟁 관련 최신 뉴스 최대 8건 수집"""
    rss_feeds = [
        ("https://www.aljazeera.com/xml/rss/all.xml", "Al Jazeera"),
        ("http://feeds.bbci.co.uk/news/world/middle_east/rss.xml", "BBC"),
        ("https://feeds.reuters.com/reuters/worldNews", "Reuters"),
    ]
    keywords = ["iran", "israel", "hormuz", "war", "oil", "energy", "strike", "sanction",
                "이란", "이스라엘", "전쟁", "원유", "제재"]

    all_items = []
    for rss_url, source in rss_feeds:
        try:
            api_url = f"https://api.rss2json.com/v1/api.json?rss_url={urllib.parse.quote(rss_url)}&count=20"
            req = urllib.request.Request(api_url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=10) as r:
                data = json.loads(r.read())
            items = data.get("items", [])
            for item in items:
                title = item.get("title", "")
                desc = item.get("description", "")
                combined = (title + " " + desc).lower()
                score = sum(1 for kw in keywords if kw.lower() in combined)
                if score >= 1:
                    all_items.append({
                        "title": title,
                        "description": re.sub(r"<[^>]+>", "", desc)[:200],
                        "link": item.get("link", ""),
                        "pubDate": item.get("pubDate", ""),
                        "source": source,
                        "score": score,
                    })
            print(f"[✓ RSS] {source}: {len(items)}건 수집, 관련 {sum(1 for i in all_items if True)}건")
        except Exception as e:
            print(f"[✗ RSS {source}] {e}")

    # 점수 내림차순 정렬 후 상위 8건
    all_items.sort(key=lambda x: (-x["score"], x["pubDate"]), reverse=False)
    all_items.sort(key=lambda x: x["score"], reverse=True)
    result = all_items[:8]
    # score 필드 제거 (노출 불필요)
    for item in result:
        item.pop("score", None)
    return result

# ─── 전쟁 요약 문장 생성 ─────────────────────────────────────
def generate_war_summary(news_items: list[dict]) -> str:
    if not news_items:
        return "이란-미국/이스라엘 전쟁 관련 최신 뉴스를 불러오는 중입니다."
    latest = news_items[0]
    date_str = latest.get("pubDate", "")[:10] if latest.get("pubDate") else ""
    src = latest.get("source", "")
    return f"최신: {latest['title'][:60]} ({src}{', ' + date_str if date_str else ''})"

# ─── 메인 ────────────────────────────────────────────────────
def main():
    import urllib.parse  # fetch_war_news에서 필요

    now = datetime.now(KST)
    now_iso = now.isoformat()
    now_display = now.strftime("%Y년 %-m월 %-d일 %H:%M KST")
    print(f"\n=== FlameMap Live Data Update — {now_display} ===\n")

    existing = load_existing()

    # 원자재 가격 수집
    print("▶ 원자재 가격 수집 중...")
    market = collect_market_prices(existing)

    # 전쟁 뉴스 수집
    print("\n▶ 전쟁 뉴스 수집 중...")
    news = fetch_war_news()
    summary = generate_war_summary(news)

    # JSON 빌드
    payload = {
        "updatedAt": now_iso,
        "updatedAtKST": now_display,
        "marketPrices": market,
        "warNews": news,
        "warSummary": summary,
    }

    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2))
    print(f"\n[✓] live-data.json 저장 완료 ({len(news)}건 뉴스)")
    print(f"    경로: {OUTPUT_PATH}")

if __name__ == "__main__":
    import urllib.parse
    main()
