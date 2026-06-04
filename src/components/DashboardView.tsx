import React from "react";
import { BranchStats, CompetitorStats } from "../types";
import { calculateConsolidatedScore, getCorrectedEmployed } from "../utils";
import { TrendingUp, Users, Target, Shield, Award, Sparkles, Building2, MapPin } from "lucide-react";

interface Props {
  branches: BranchStats[];
  competitorStats: CompetitorStats;
}

export default function DashboardView({ branches, competitorStats }: Props) {
  const result = calculateConsolidatedScore(branches, competitorStats);

  // 권역별 지점 합계 구하기
  const regionalGroups = branches.reduce((acc, b) => {
    if (!acc[b.region]) acc[b.region] = [];
    acc[b.region].push(b);
    return acc;
  }, {} as { [key: string]: BranchStats[] });

  // 가점 정보의 세부
  let maxBestPractice = "-";
  let maxPracticeName = "";
  branches.forEach(b => {
    if (b.bestPracticeAward !== "none") {
      if (b.bestPracticeAward === "target") { maxBestPractice = "대상 (2.0점)"; maxPracticeName = b.name; }
      else if (b.bestPracticeAward === "best" && maxBestPractice !== "대상 (2.0점)") { maxBestPractice = "최우수 (1.0점)"; maxPracticeName = b.name; }
      else if (b.bestPracticeAward === "excellent" && !maxBestPractice.includes("대상") && !maxBestPractice.includes("최우수")) { maxBestPractice = "우수 (0.7점)"; maxPracticeName = b.name; }
      else if (b.bestPracticeAward === "normal" && maxBestPractice === "-") { maxBestPractice = "장려 (0.5점)"; maxPracticeName = b.name; }
    }
  });

  const totalOtherProjectCount = branches.reduce((sum, b) => sum + b.otherProjectLinkedCount, 0);

  return (
    <div className="space-y-6">
      {/* 1. 상단 하이라이트 배너 */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 -mt-6 -mr-6 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              국제커리어센터 총괄 PM 성과관리포털
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              2026년도 국취제 민간위탁기관 성과평가 시뮬레이터
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              24개 소속 지점 실적 통합 원클릭 표준점수 시뮬레이터 및 고용부 상대평가 예측 도구
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-300">통합 평가등급 예측</div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-indigo-200">
                  {result.predictedGrade}등급
                </span>
                <span className="text-xs text-indigo-300 font-medium">
                  ({result.predictedGrade === "A" ? "상위 20% 진입" : result.predictedGrade === "B" ? "차상위 40%" : result.predictedGrade === "C" ? "하위 25%" : "최하위 15%"})
                </span>
              </div>
            </div>
            <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-300">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. 핵심 요약 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 카드 1: 종합 표준점수 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase">가중합산 표준점수</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{result.totalScore} 점</div>
            </div>
            <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">기본 지표: {(result.totalScore - result.totalBonus).toFixed(2)}점</span>
            <span className="text-indigo-600 font-semibold">+ 가점: {result.totalBonus.toFixed(1)}점</span>
          </div>
        </div>

        {/* 카드 2: 보정 취업자 및 취업률 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase">보정 취업자 및 취업률</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{result.employmentRate}%</div>
            </div>
            <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-600">
            <span>보정 취업자: <strong className="text-indigo-600 font-bold">{result.employmentCountCorrected}명</strong></span>
            <span>종료자: {branches.reduce((s, b) => s + b.terminations, 0)}명</span>
          </div>
        </div>

        {/* 카드 3: 알선취업률 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase">보정 알선취업률</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{result.placementRate}%</div>
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-600">
            <span>보정 알선수: <strong className="text-emerald-600 font-bold">{result.placementCountCorrected}명</strong></span>
            <span>전체 가중: {result.placementAppliedWeight} 적용</span>
          </div>
        </div>

        {/* 카드 4: 조기취업률 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase">보정 조기취업률</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{result.earlyRate}%</div>
            </div>
            <div className="bg-amber-50 text-amber-600 p-2 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-600">
            <span>보정 조기취업: <strong className="text-amber-600 font-bold">{result.earlyCountCorrected}명</strong></span>
            <span>조기 배점: 10점 {result.earlyAppliedWeight} 적용</span>
          </div>
        </div>
      </div>

      {/* 3. 대시보드 2단 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 좌측 2칸: 지표별 표준점수 상세 비교 */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-indigo-600" />
            당기 공식 평가지표 상세 산정 현황
          </h2>
          <div className="space-y-4">
            {/* 1. 취업실적 */}
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-sm text-slate-800">① 취업실적 (배점 30점)</span>
                <span className="text-sm font-bold text-slate-900">{result.employmentFinalScore}점 / 30점</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mt-1.5 mb-2.5">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all"
                  style={{ width: `${(result.employmentFinalScore / 30) * 100}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400">비율점수 (80% / 90%):</span> {result.employmentRateStdScore}점
                  <span className="ml-1 text-slate-400">({result.employmentRate}%)</span>
                </div>
                <div>
                  <span className="text-slate-400">규모점수 (20% / 10%):</span> {result.employmentCountStdScore}점
                  <span className="ml-1 text-slate-400">({result.employmentCountCorrected}명)</span>
                </div>
              </div>
              <div className="text-[11px] text-indigo-600 font-semibold mt-1">
                ※ 총점 극대화를 위해 {result.employmentAppliedWeight} 가중 비율이 자동 선별 적용되었습니다.
              </div>
            </div>

            {/* 2. 알선취업실적 */}
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-sm text-slate-800">② 알선취업실적 (배점 25점)</span>
                <span className="text-sm font-bold text-slate-900">{result.placementFinalScore}점 / 25점</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mt-1.5 mb-2.5">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${(result.placementFinalScore / 25) * 100}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400">비율점수:</span> {result.placementRateStdScore}점
                  <span className="ml-1 text-slate-400">({result.placementRate}%)</span>
                </div>
                <div>
                  <span className="text-slate-400">규모점수:</span> {result.placementCountStdScore}점
                  <span className="ml-1 text-slate-400">({result.placementCountCorrected}명)</span>
                </div>
              </div>
            </div>

            {/* 3. 조기취업실적 */}
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-sm text-slate-800">③ 조기취업실적 (배점 10점)</span>
                <span className="text-sm font-bold text-slate-900">{result.earlyFinalScore}점 / 10점</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mt-1.5 mb-2.5">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${(result.earlyFinalScore / 10) * 100}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400">비율점수:</span> {result.earlyRateStdScore}점
                  <span className="ml-1 text-slate-400">({result.earlyRate}%)</span>
                </div>
                <div>
                  <span className="text-slate-400">규모점수:</span> {result.earlyCountStdScore}점
                  <span className="ml-1 text-slate-400">({result.earlyCountCorrected}명)</span>
                </div>
              </div>
            </div>

            {/* 4. 임금수준 및 고용유지, 만족도 공동 그룹 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div className="font-semibold text-xs text-slate-700 uppercase">④ 임금수준 (10점)</div>
                <div className="text-lg font-bold text-slate-900 mt-1">{result.wageFinalScore}점</div>
                <div className="text-[11px] text-slate-500 mt-1">기준충족 비중: {result.wageRate}%</div>
              </div>
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div className="font-semibold text-xs text-slate-700 uppercase">⑤ 고용유지 (15점)</div>
                <div className="text-lg font-bold text-slate-900 mt-1">{result.retentionFinalScore}점</div>
                <div className="text-[11px] text-slate-500 mt-1">6개월유지 비중: {result.retentionRate}%</div>
              </div>
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div className="font-semibold text-xs text-slate-700 uppercase">⑥ 참여자만족도 (10점)</div>
                <div className="text-lg font-bold text-slate-900 mt-1">{result.satisfactionFinalScore}점</div>
                <div className="text-[11px] text-slate-500 mt-1">상위80% 평균: {result.satisfactionRate}점</div>
              </div>
            </div>
          </div>
        </div>

        {/* 우측 1칸: 권역별 실적 분포 & 가점 트래커 */}
        <div className="space-y-6">
          {/* 가점 정보 트래커 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-indigo-600" />
              가점 관리 현황 (최대 5.0점)
            </h2>
            <div className="space-y-4">
              {/* 우수사례 */}
              <div className="flex justify-between items-start text-xs border-b border-slate-100 pb-3">
                <div>
                  <div className="font-semibold text-slate-800">우수사례 공모전 장관상</div>
                  <div className="text-slate-500 mt-0.5">훈격: {maxBestPractice} {maxPracticeName && `(${maxPracticeName})`}</div>
                </div>
                <div className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold">
                  +{result.bestPracticeBonus.toFixed(1)}점
                </div>
              </div>

              {/* 타 사업 연계 */}
              <div className="flex justify-between items-start text-xs pb-1">
                <div>
                  <div className="font-semibold text-slate-800">타 사업 연계 (24개 지점 합산)</div>
                  <div className="text-slate-500 mt-0.5">누적 연계 건수: <strong className="text-indigo-600">{totalOtherProjectCount}건</strong></div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    9건↓ 0점 / 10~19건 1점 / 20~39건 2점 / 40건↑ 3점
                  </div>
                </div>
                <div className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold">
                  +{result.otherProjectBonus.toFixed(1)}점
                </div>
              </div>

              {/* 가점 합계 게이지 */}
              <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 mt-2">
                <div className="flex justify-between items-center text-xs text-indigo-900 font-bold mb-1">
                  <span>총 가점 합산</span>
                  <span>{result.totalBonus.toFixed(1)} / 5.0점</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${(result.totalBonus / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* 권역별 분포 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-indigo-600" />
              권역별 종료자 및 보정 취업 현황
            </h2>
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {Object.entries(regionalGroups).map(([region, list]) => {
                const totalRegionTerm = list.reduce((sum, b) => sum + b.terminations, 0);
                const totalRegionEmp = list.reduce((sum, b) => sum + getCorrectedEmployed(b), 0);
                const rate = totalRegionTerm > 0 ? (totalRegionEmp / totalRegionTerm) * 100 : 0;
                
                return (
                  <div key={region} className="text-xs border-b border-slate-50 pb-2 last:border-none last:pb-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-800">{region} ({list.length}개소)</span>
                      <span className="font-bold text-slate-900">{rate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-slate-700 h-full rounded-full"
                        style={{ width: `${Math.min(100, rate)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>종료: {totalRegionTerm}명</span>
                      <span>보정취업: {Math.round(totalRegionEmp)}명</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
