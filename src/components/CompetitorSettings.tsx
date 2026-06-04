import React from "react";
import { CompetitorStats } from "../types";
import { RotateCcw, Save } from "lucide-react";
import { DEFAULT_COMPETITOR_STATS } from "../types";

interface Props {
  competitorStats: CompetitorStats;
  onUpdateStats: (newStats: CompetitorStats) => void;
}

export default function CompetitorSettings({ competitorStats, onUpdateStats }: Props) {
  const handleReset = () => {
    if (window.confirm("전국 수탁기관 평균 및 표준편차 통계치를 기본 권장값으로 초기화하시겠습니까?")) {
      onUpdateStats(JSON.parse(JSON.stringify(DEFAULT_COMPETITOR_STATS)));
    }
  };

  const handleFieldChange = (field: keyof CompetitorStats, val: number) => {
    onUpdateStats({
      ...competitorStats,
      [field]: val
    });
  };

  const handleWageChange = (region: string, val: number, isMean: boolean) => {
    if (isMean) {
      onUpdateStats({
        ...competitorStats,
        wageRateMeans: {
          ...competitorStats.wageRateMeans,
          [region]: val
        }
      });
    } else {
      onUpdateStats({
        ...competitorStats,
        wageRateStds: {
          ...competitorStats.wageRateStds,
          [region]: val
        }
      });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900">전국 타 수탁기관 실적 통계 설정</h2>
          <p className="text-xs text-slate-500 mt-1">
            고용부의 표준점수 환산 공식은 전국 경쟁 기관들의 실적 통계(평균, 표준편차)에 상대평가로 대입됩니다. 이곳에서 공식 통계를 조정하여 점수 등급 승강 리스크를 다각도로 예측해 볼 수 있습니다.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          기본값 복원
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
        {/* 취업 지표 통계 */}
        <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100 space-y-3">
          <span className="font-bold text-slate-800 block text-xs">① 취업 실적 통계</span>
          <div>
            <label className="block text-slate-600 mb-1">전국 평균 취업률 (%)</label>
            <input
              type="number"
              step="0.1"
              value={competitorStats.employmentRateMean}
              onChange={(e) => handleFieldChange("employmentRateMean", parseFloat(e.target.value) || 0)}
              className="w-full bg-white border border-slate-200 rounded p-1.5"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1">전국 취업률 표준편차</label>
            <input
              type="number"
              step="0.1"
              value={competitorStats.employmentRateStd}
              onChange={(e) => handleFieldChange("employmentRateStd", parseFloat(e.target.value) || 0)}
              className="w-full bg-white border border-slate-200 rounded p-1.5"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1">전국 평균 보정 취업자수 (명)</label>
            <input
              type="number"
              value={competitorStats.employmentCountMean}
              onChange={(e) => handleFieldChange("employmentCountMean", parseInt(e.target.value) || 0)}
              className="w-full bg-white border border-slate-200 rounded p-1.5"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1">전국 보정 취업자 표준편차</label>
            <input
              type="number"
              value={competitorStats.employmentCountStd}
              onChange={(e) => handleFieldChange("employmentCountStd", parseInt(e.target.value) || 0)}
              className="w-full bg-white border border-slate-200 rounded p-1.5"
            />
          </div>
        </div>

        {/* 알선 지표 통계 */}
        <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100 space-y-3">
          <span className="font-bold text-slate-800 block text-xs">② 알선 및 조기취업 통계</span>
          <div>
            <label className="block text-slate-600 mb-1">전국 평균 알선취업률 (%)</label>
            <input
              type="number"
              step="0.1"
              value={competitorStats.placementRateMean}
              onChange={(e) => handleFieldChange("placementRateMean", parseFloat(e.target.value) || 0)}
              className="w-full bg-white border border-slate-200 rounded p-1.5"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1">전국 알선취업률 표준편차</label>
            <input
              type="number"
              step="0.1"
              value={competitorStats.placementRateStd}
              onChange={(e) => handleFieldChange("placementRateStd", parseFloat(e.target.value) || 0)}
              className="w-full bg-white border border-slate-200 rounded p-1.5"
            />
          </div>
          <div className="pt-2 border-t border-slate-200/50">
            <label className="block text-slate-600 mb-1">전국 평균 조기취업률 (%)</label>
            <input
              type="number"
              step="0.1"
              value={competitorStats.earlyRateMean}
              onChange={(e) => handleFieldChange("earlyRateMean", parseFloat(e.target.value) || 0)}
              className="w-full bg-white border border-slate-200 rounded p-1.5"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1">전국 조기취업률 표준편차</label>
            <input
              type="number"
              step="0.1"
              value={competitorStats.earlyRateStd}
              onChange={(e) => handleFieldChange("earlyRateStd", parseFloat(e.target.value) || 0)}
              className="w-full bg-white border border-slate-200 rounded p-1.5"
            />
          </div>
        </div>

        {/* 고용유지 및 만족도 */}
        <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100 space-y-3">
          <span className="font-bold text-slate-800 block text-xs">⑤ 고용유지 및 만족도 통계</span>
          <div>
            <label className="block text-slate-600 mb-1">전국 평균 6개월 고용유지율 (%)</label>
            <input
              type="number"
              step="0.1"
              value={competitorStats.retentionRateMean}
              onChange={(e) => handleFieldChange("retentionRateMean", parseFloat(e.target.value) || 0)}
              className="w-full bg-white border border-slate-200 rounded p-1.5"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1">전국 6개월 고용유지 표준편차</label>
            <input
              type="number"
              step="0.1"
              value={competitorStats.retentionRateStd}
              onChange={(e) => handleFieldChange("retentionRateStd", parseFloat(e.target.value) || 0)}
              className="w-full bg-white border border-slate-200 rounded p-1.5"
            />
          </div>
          <div className="pt-2 border-t border-slate-200/50">
            <label className="block text-slate-600 mb-1">전국 평균 기관만족도 점수</label>
            <input
              type="number"
              step="0.1"
              value={competitorStats.satisfactionMean}
              onChange={(e) => handleFieldChange("satisfactionMean", parseFloat(e.target.value) || 0)}
              className="w-full bg-white border border-slate-200 rounded p-1.5"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1">전국 기관만족도 표준편차</label>
            <input
              type="number"
              step="0.1"
              value={competitorStats.satisfactionStd}
              onChange={(e) => handleFieldChange("satisfactionStd", parseFloat(e.target.value) || 0)}
              className="w-full bg-white border border-slate-200 rounded p-1.5"
            />
          </div>
        </div>
      </div>

      {/* 권역별 임금수준 통계 */}
      <div className="bg-slate-50/40 p-5 rounded-xl border border-slate-200 text-xs">
        <span className="font-bold text-slate-800 block text-xs mb-3">④ 권역별 임금수준 (최저 120%↑ 비율) 평균 및 표준편차 설정</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.keys(competitorStats.wageRateMeans).map(region => (
            <div key={region} className="bg-white p-3 rounded-lg border border-slate-100 space-y-2">
              <span className="font-bold text-slate-800 block text-[11px] border-b border-slate-100 pb-1">{region} 권역</span>
              <div>
                <label className="block text-slate-500 scale-95 origin-left mb-0.5">평균 (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={competitorStats.wageRateMeans[region]}
                  onChange={(e) => handleWageChange(region, parseFloat(e.target.value) || 0, true)}
                  className="w-full border border-slate-200 rounded p-1"
                />
              </div>
              <div>
                <label className="block text-slate-500 scale-95 origin-left mb-0.5">표준편차</label>
                <input
                  type="number"
                  step="0.1"
                  value={competitorStats.wageRateStds[region]}
                  onChange={(e) => handleWageChange(region, parseFloat(e.target.value) || 0, false)}
                  className="w-full border border-slate-200 rounded p-1"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
