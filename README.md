# FlameMap 🔥

**이란-이스라엘 전쟁 × 에너지 가격 실시간 트래커**

49개국 6종 에너지 가격 비교 · 국제유가 실시간 · 전황 브리핑 · 트럼프 Truth Social

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss)](https://tailwindcss.com)

---

## 데모

**🔗 라이브**: https://wn9t0a6e1fyz.space.minimax.io

---

## 주요 기능

| 탭 | 내용 |
|---|---|
| 🗺️ 지도 | 세계 지도 + 국가별 에너지 가격 히트맵 + 가격변화율 오버레이 마커 |
| 📊 차트 | 선택 국가 vs 한국 vs 세계 평균 에너지 시계열 비교 |
| 🏆 랭킹 | 가격변화율 랭킹 / 🌍 에너지 요금 국가별 비교 매트릭스 |
| ⚠️ 타임라인 | 이란-이스라엘 전쟁 사건일지 (Day별) |
| 📡 전황 | 브리핑 / 사건일지 / 뉴스 / 🇺🇸 트럼프 Truth Social |
| ⚡ 시뮬레이터 | 에너지 가격 충격 시나리오 시뮬레이션 |

### 에너지 종류 (6종)
- ⛽ 휘발유 (USD/L)
- 🛢 경유 (USD/L)
- 🔥 LNG (USD/MMBtu)
- 🏠 전기 가정용 (USD/kWh)
- 🏭 전기 산업용 (USD/kWh)
- 💧 LPG (USD/L)

---

## 기술 스택

- **Framework**: React 18 + TypeScript
- **빌드**: Vite 6 + 코드 스플리팅
- **스타일**: TailwindCSS v3
- **지도**: react-simple-maps + D3
- **차트**: Recharts
- **데이터 검증**: Zod 런타임 스키마 검증
- **패키지 관리**: pnpm

---

## 로컬 실행

```bash
# 클론
git clone https://github.com/jettiy/flamemap.git
cd flamemap

# 패키지 설치 (pnpm 권장)
pnpm install
# 또는
npm install

# 개발 서버 실행 (http://localhost:5173)
pnpm dev

# 프로덕션 빌드
pnpm build

# 빌드 미리보기
pnpm preview
```

**요구사항**: Node.js 18+

---

## 프로젝트 구조

```
flamemap/
├── public/
│   └── live-data.json       # 실시간 전황 + 유가 데이터 (크론 6시간 업데이트)
├── scripts/
│   └── update_live_data.py  # 데이터 수집 스크립트
└── src/
    ├── App.tsx              # 메인 레이아웃 + 탭 구성
    ├── data/
    │   ├── constants.ts     # 전역 상수 (WAR_START_DATE 등)
    │   ├── countries.ts     # 49개국 에너지 가격 데이터
    │   ├── categories.ts    # 에너지 종류 정의
    │   ├── types.ts         # TypeScript 타입
    │   ├── utils.ts         # 유틸 함수
    │   ├── eiaService.ts    # live-data.json fetch + Zod 검증
    │   ├── warTimeline.ts   # 전쟁 타임라인 정적 데이터
    │   └── trumpPosts.ts    # 트럼프 Truth Social 정적 데이터
    └── components/
        ├── WorldMap.tsx           # 세계 지도 + 오버레이 마커
        ├── PriceChart.tsx         # 에너지 가격 시계열 차트
        ├── RankingPanel.tsx       # 가격변화율 랭킹
        ├── RankingSubTabs.tsx     # 랭킹 서브탭 컨테이너
        ├── EnergyMatrixPanel.tsx  # 에너지 요금 비교 매트릭스
        ├── WarTimeline.tsx        # 전쟁 타임라인
        ├── WarBriefingPanel.tsx   # 전황 브리핑 (4탭)
        ├── ShockSimulator.tsx     # 에너지 충격 시뮬레이터
        ├── CountrySearch.tsx      # 국가 검색
        ├── DataStatusBadge.tsx    # 데이터 상태 배지
        ├── MarketTicker.tsx       # 실시간 시세 티커
        └── ...
```

---

## 데이터 소스

| 소스 | 내용 | 업데이트 주기 |
|---|---|---|
| GlobalPetrolPrices.com | 49개국 에너지 소매가 (6종) | 매주 |
| public/live-data.json | 국제유가 · 전황 브리핑 · 뉴스 | 6시간마다 |

> **라이선스 주의**: GlobalPetrolPrices.com 데이터는 CC BY-NC-ND 3.0 (비상업 · 출처표기 필수)

---

## 라이선스

MIT License

---

## 관련 프로젝트

- [AI이것만 (onlyAI)](https://github.com/jettiy/onlyAI) — 국내 AI 서비스 최신 현황 가이드
