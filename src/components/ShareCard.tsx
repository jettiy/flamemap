import React, { useState, useCallback } from 'react';
import { Country, EnergyType, CategoryInfo } from '../data/types';
import { countryChangeRate, getFlagEmoji, formatPrice } from '../data/utils';
import { SHARE_BASE_URL } from '../data/constants';

// ── Props ─────────────────────────────────────────────────────

interface ShareCardProps {
  country: Country | null;
  koreaCountry: Country;
  category: EnergyType;
  categoryInfo: CategoryInfo;
  showKRW: boolean;
  onClose: () => void;
}

// ── 헬퍼 ──────────────────────────────────────────────────────

const SHARE_URL = SHARE_BASE_URL;

function buildShareText(
  country: Country,
  koreaCountry: Country,
  category: EnergyType,
  categoryInfo: CategoryInfo,
): string {
  const flag      = getFlagEmoji(country.id);
  const rate      = countryChangeRate(country, category);
  const krRate    = countryChangeRate(koreaCountry, category);
  const baseline  = country.prices[category].baseline;
  const current   = country.prices[category].current;
  const unit      = country.prices[category].unit;
  const krCurrent = koreaCountry.prices[category].current;

  const rateSign  = rate >= 0 ? '+' : '';
  const trendWord = rate >= 5 ? '급등' : rate >= 0 ? '상승' : '하락';
  const krCompPct = krCurrent > 0
    ? (((current - krCurrent) / krCurrent) * 100).toFixed(1)
    : '0';
  const isExpensive = current > krCurrent;

  const lines = [
    `${flag} ${country.nameKo} ${categoryInfo.nameKo} ${rateSign}${rate}% ${trendWord}`,
    `전쟁 전 ${baseline} ${unit} → 현재 ${current} ${unit}`,
    isExpensive
      ? `한국보다 ${Math.abs(parseFloat(krCompPct))}% 비쌉니다`
      : `한국보다 ${Math.abs(parseFloat(krCompPct))}% 쌉니다`,
    `🌍 에너지 전쟁 지도에서 확인`,
    SHARE_URL,
  ];

  return lines.join('\n');
}

function buildTwitterUrl(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

// ── 컴포넌트 ──────────────────────────────────────────────────

const ShareCard: React.FC<ShareCardProps> = ({
  country,
  koreaCountry,
  category,
  categoryInfo,
  showKRW,
  onClose,
}) => {
  const [toastVisible, setToastVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  // 선택된 국가가 없으면 한국 기준으로 표시
  const targetCountry = country ?? koreaCountry;

  const rate     = countryChangeRate(targetCountry, category);
  const flag     = getFlagEmoji(targetCountry.id);
  const rateSign = rate >= 0 ? '+' : '';
  const priceData = targetCountry.prices[category];

  const shareText = buildShareText(
    targetCountry,
    koreaCountry,
    category,
    categoryInfo,
  );

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${SHARE_URL}`);
    } catch {
      // fallback: select + copy
      const el = document.createElement('textarea');
      el.value = `${shareText}\n${SHARE_URL}`;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
      setCopied(false);
    }, 2000);
  }, [shareText]);

  const handleTwitterShare = useCallback(() => {
    window.open(buildTwitterUrl(shareText), '_blank', 'noopener,noreferrer');
  }, [shareText]);

  return (
    <>
      {/* 오버레이 배경 */}
      <div
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 슬라이드업 패널 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 rounded-t-2xl border-t border-slate-700 shadow-2xl animate-slide-up max-w-lg mx-auto">
        {/* 드래그 핸들 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-600" />
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">📤 공유하기</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl leading-none px-1"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* 미리보기 카드 */}
        <div className="mx-4 mt-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 border border-slate-700">
          {/* 국기 + 국명 */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">{flag}</span>
            <div>
              <div className="text-base font-bold text-white">{targetCountry.nameKo}</div>
              <div className="text-xs text-slate-400">{categoryInfo.nameKo} · {categoryInfo.unit}</div>
            </div>
          </div>

          {/* 가격 정보 */}
          <div className="flex items-end gap-3 mb-2">
            <div>
              <div className="text-xs text-slate-500 mb-0.5">전쟁 전</div>
              <div className="font-mono text-sm text-slate-400">
                {formatPrice(priceData.baseline, priceData.unit, showKRW)}
              </div>
            </div>
            <div className="text-slate-600 text-lg">→</div>
            <div>
              <div className="text-xs text-slate-500 mb-0.5">현재</div>
              <div className="font-mono text-sm text-white font-semibold">
                {formatPrice(priceData.current, priceData.unit, showKRW)}
              </div>
            </div>
          </div>

          {/* 변화율 강조 배지 */}
          <div
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
              rate >= 0
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-green-500/20 text-green-400 border border-green-500/30'
            }`}
          >
            {rate >= 0 ? '▲' : '▼'} {rateSign}{rate}%
            <span className="font-normal text-xs ml-1">
              {rate >= 5 ? '급등' : rate >= 0 ? '상승' : '하락'}
            </span>
          </div>

          {/* 하단 태그 */}
          <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-1 text-xs text-slate-500">
            <span>🌍</span>
            <span>에너지 전쟁 지도</span>
            <span className="ml-auto text-slate-600">{SHARE_URL}</span>
          </div>
        </div>

        {/* 공유 버튼들 */}
        <div className="grid grid-cols-2 gap-3 mx-4 mt-4 mb-6">
          <button
            onClick={handleCopyLink}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors ${
              copied
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-white hover:bg-slate-600'
            }`}
          >
            {copied ? '✅ 복사됨!' : '🔗 링크 복사'}
          </button>

          <button
            onClick={handleTwitterShare}
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-[#1d9bf0] text-white hover:bg-[#1a8cd8] transition-colors"
          >
            𝕏&nbsp;트위터 공유
          </button>
        </div>
      </div>

      {/* 토스트 메시지 */}
      {toastVisible && (
        <div className="fixed bottom-36 left-1/2 -translate-x-1/2 z-[60] bg-slate-700 text-white text-sm px-4 py-2 rounded-full shadow-lg whitespace-nowrap animate-fade-in">
          링크 복사됨! 📋
        </div>
      )}
    </>
  );
};

export default ShareCard;
