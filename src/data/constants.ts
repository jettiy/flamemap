/**
 * constants.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * 프로젝트 전역 상수 — 여기서만 수정하면 전체 반영
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** 이란-이스라엘 전쟁 개전일 (2026년 2월 28일, 미국·이스라엘 연합 공습 개시) */
export const WAR_START_DATE = '2026-02-28';

/** 차트 히스토리 시작 연월 */
export const CHART_HISTORY_FROM = '2025-01';

/** 차트 히스토리 종료 연월 (현재) */
export const CHART_HISTORY_TO = '2026-03';

/** 배포 공유 URL — 환경변수 우선, 없으면 현재 origin */
export const SHARE_BASE_URL: string =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SHARE_URL) ||
  (typeof window !== 'undefined' ? window.location.origin : 'https://flamemap.app');

/** GlobalPetrolPrices.com 데이터 기준일 */
export const ENERGY_DATA_REFERENCE_DATE = '2026-03-16';

/** USD → KRW 환율 (live-data.json에서 갱신 가능) */
/** USD/KRW 환율 — Yahoo Finance 2026-03-23 실데이터 */
export const USD_TO_KRW_DEFAULT = 1504.17;
