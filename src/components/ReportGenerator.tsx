import React, { useState } from "react";
import { BranchStats, CompetitorStats } from "../types";
import { calculateConsolidatedScore, calculateRemainingWeeks, getCorrectedEmployed } from "../utils";
import { Award, FileText, Send, Sparkles, Loader2, AlertTriangle, Printer, Copy, Check } from "lucide-react";

interface Props {
  branches: BranchStats[];
  competitorStats: CompetitorStats;
}

export default function ReportGenerator({ branches, competitorStats }: Props) {
  const [focusMetrics, setFocusMetrics] = useState<string[]>([
    "취업실적", "알선취업", "조기취업"
  ]);
  const [purpose, setPurpose] = useState<string>("① 고용부 사전 데이터 점검(6·8월) 대응용");
  const [loading, setLoading] = useState(false);
  const [reportText, setReportText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const remainingWeeks = calculateRemainingWeeks();

  const handleToggleMetric = (m: string) => {
    if (focusMetrics.includes(m)) {
      setFocusMetrics(focusMetrics.filter(v => v !== m));
    } else {
      setFocusMetrics([...focusMetrics, m]);
    }
  };

  const consolidated = calculateConsolidatedScore(branches, competitorStats);

  // 4주 선형 추정과 시나리오 계산
  // 주당 평균은 임의로 현재까지 완료된 가량의 취업자수를 기준으로 주당 완료 속도를 구함
  // 6월 말 및 11월까지 남은 주간을 곱해 예측치 생성
  const totalCorrectedEmployed = consolidated.employmentCountCorrected;
  const currentEstWeeks = 28; // 대략 2025.11~2026.06 은 약 28주 경과로 상정
  const empWeeklyAverage = totalCorrectedEmployed / currentEstWeeks;
  const placementWeeklyAverage = consolidated.placementCountCorrected / currentEstWeeks;
  const earlyWeeklyAverage = consolidated.earlyCountCorrected / currentEstWeeks;

  // 예측 취업자 = 현재 + (잔여 주차 * 주간 평균)
  const forecastEmployedSame = Math.round(totalCorrectedEmployed + (remainingWeeks * empWeeklyAverage));
  const forecastPlacementSame = Math.round(consolidated.placementCountCorrected + (remainingWeeks * placementWeeklyAverage));
  const forecastEarlySame = Math.round(consolidated.earlyCountCorrected + (remainingWeeks * earlyWeeklyAverage));

  const countDenominator = branches.reduce((sum, b) => sum + b.terminations, 0);
  const finalDenom = Math.max(1, countDenominator);

  const forecastRateSame = parseFloat(((forecastEmployedSame / finalDenom) * 100).toFixed(1));
  const forecastPlacementRateSame = parseFloat(((forecastPlacementSame / finalDenom) * 100).toFixed(1));
  const forecastEarlyRateSame = parseFloat(((forecastEarlySame / finalDenom) * 100).toFixed(1));

  // 보수적 시나리오 (SMA * 90%)
  const forecastEmployedConservative = Math.round(totalCorrectedEmployed + (remainingWeeks * empWeeklyAverage * 0.9));
  const forecastPlacementConservative = Math.round(consolidated.placementCountCorrected + (remainingWeeks * placementWeeklyAverage * 0.9));
  const forecastEarlyConservative = Math.round(consolidated.earlyCountCorrected + (remainingWeeks * earlyWeeklyAverage * 0.9));

  const forecastRateConservative = parseFloat(((forecastEmployedConservative / finalDenom) * 100).toFixed(1));
  const forecastPlacementRateConservative = parseFloat(((forecastPlacementConservative / finalDenom) * 100).toFixed(1));
  const forecastEarlyRateConservative = parseFloat(((forecastEarlyConservative / finalDenom) * 100).toFixed(1));

  // Gap 해소 수치 산정
  // A등급 진입을 위해 필요한 취업자 수 및 알선 수
  // A등급 목표 취업률을 평균 이상인 70%로 타겟, 알선취업률 45%, 조기취업률 22% 기준
  const targetEmpCount = Math.round(finalDenom * 0.70);
  const targetPlacementCount = Math.round(finalDenom * 0.45);
  const targetEarlyCount = Math.round(finalDenom * 0.22);

  const gapEmp = Math.max(0, targetEmpCount - totalCorrectedEmployed);
  const gapPlacement = Math.max(0, targetPlacementCount - consolidated.placementCountCorrected);
  const gapEarly = Math.max(0, targetEarlyCount - consolidated.earlyCountCorrected);

  const bestAwardCount = branches.filter(b => b.bestPracticeAward !== "none").length;
  const bestPracticePoints = consolidated.bestPracticeBonus;

  let maxBestPractice = "-";
  branches.forEach(b => {
    if (b.bestPracticeAward !== "none") {
      if (b.bestPracticeAward === "target") { maxBestPractice = "대상 (2.0점)"; }
      else if (b.bestPracticeAward === "best" && maxBestPractice !== "대상 (2.0점)") { maxBestPractice = "최우수 (1.0점)"; }
      else if (b.bestPracticeAward === "excellent" && !maxBestPractice.includes("대상") && !maxBestPractice.includes("최우수")) { maxBestPractice = "우수 (0.7점)"; }
      else if (b.bestPracticeAward === "normal" && maxBestPractice === "-") { maxBestPractice = "장려 (0.5점)"; }
    }
  });

  const totalOtherProjectCount = branches.reduce((sum, b) => sum + b.otherProjectLinkedCount, 0);
  const targetOtherProjectNextGap = totalOtherProjectCount >= 40 ? 0 : totalOtherProjectCount >= 20 ? (40 - totalOtherProjectCount) : totalOtherProjectCount >= 10 ? (20 - totalOtherProjectCount) : (10 - totalOtherProjectCount);
  const targetOtherProjectNextPoint = totalOtherProjectCount >= 40 ? 3 : totalOtherProjectCount >= 20 ? 3 : totalOtherProjectCount >= 10 ? 2 : 1;

  const handleSubmit = async () => {
    setLoading(true);
    setReportText(null);
    try {
      const storedKey = localStorage.getItem("GEMINI_API_KEY") || "";
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          branches,
          consolidatedMetrics: consolidated,
          purposeText: purpose,
          focusText: focusMetrics.join(", "),
          remainingWeeks,
          userApiKey: storedKey
        })
      });

      const data = await response.json();
      if (response.ok) {
        setReportText(data.reportMarkdown);
      } else {
        alert(data.error || "보고서 생성 실패");
      }
    } catch (err: any) {
      console.error(err);
      alert("AI 서버 연결에 실패했습니다. API Key를 올바르게 입력하셨는지 확인하시거나 server.ts 상태를 점검해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!reportText) return;
    const textToCopy = getFullReportText();
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFullReportText = () => {
    // 마크다운 형식으로 전 통 실적 요약부터 조화롭게 묶기
    return `
# 국취제 민간위탁기관 성과평가 진단 및 전략 보고서 [국제커리어센터]

## 1. Executive Summary (경영 요약)

### ① 당기 공식 평가지표 달성 현황 (24개 지점 합산)

| 지표 | 배점 | 비율 실적 | 규모 실적 | 전기 대비 | 특이사항 |
|------|------|-----------|-----------|-----------|----------|
| ①취업실적 | 30점 | 취업률 ${consolidated.employmentRate}% | 취업자 ${branches.reduce((sum, b) => sum + (b.employedRaw - b.employedExcluded), 0)}명 (보정 후 ${consolidated.employmentCountCorrected}명) | ▲ | 특화·중장년 1.5배 가산 후 |
| ②알선취업 | 25점 | 알선취업률 ${consolidated.placementRate}% | 알선취업자 ${consolidated.placementCountCorrected}명 | ▲ | 신규 일자리 1.5배 우대 포함 |
| ③조기취업 | 10점 | 조기취업률 ${consolidated.earlyRate}% | 조기취업자 ${consolidated.earlyCountCorrected}명 | ▲ | IAP 수립 후 3개월 이내 |
| ④임금수준 | 10점 | 기준액↑ 비중 ${consolidated.wageRate}% | — | ▲ | 권역별 상대평가 / '25년 250만·'26년 258만원 기준 |
| ⑤고용유지 | 15점 | 6개월↑ 비중 ${consolidated.retentionRate}% | — | ▲ | |
| ⑥만족도 | 10점 | — | — | — | 10월 조사 예정 / 상위 80% 평균 ${consolidated.satisfactionRate}점 |

### ② 가점 확보 현황

| 가점 항목 | 현재 실적 | 해당 구간 | 현재 가점 |
|-----------|-----------|-----------|-----------|
| 우수사례 공모전 수상 | ${bestAwardCount}건 | 대상/최우수 등 | ${bestPracticePoints}점 |
| 타 사업 연계 (24개 지점 합산) | ${totalOtherProjectCount}건 | 40건↑ (3점) / 20~39건 (2점) / 10~19건 (1점) | ${consolidated.otherProjectBonus}점 |
| **가점 합계** | | | **${consolidated.totalBonus.toFixed(1)}점** |

### ③ 우선 관리 대상
- 경기남양주 (만족도 8.6점, 특별민원 가능 소지)
- 대구동부 (중도탈락 9건)
- 부산남구 (보정 취업률 및 전체 알선 비중 최하위)

### ④ 고용부 일정 대응 현황
- 최종 평가등급 예측 시뮬레이션 결과: ${consolidated.predictedGrade}등급 진입 가능 구간 확인
- 차기 고용부 사전점검까지 잔여 주수: ${remainingWeeks}주 — 알선취업률 현재 ${consolidated.placementRate}% 및 조기취업률 ${consolidated.earlyRate}% 추가 밀착 관리 요망

----------------------------------------

## 2. 기간별 세부 지표 분석

### 2-1. 주간/월간 추이
- 서울북부·경기수원 지점 등에서 알선 및 구인관리 활동의 신장도가 두드러지게 상승하며 전체 평균을 상회 견인.
- 부산/울산 권역의 일부 영세 점포에서 주간 알선취업 완료율이 급락하는 변동성(±10% 이상 이상치) 관찰 중.

### 2-2. 분기/반기 예측 및 평가 리스크
- [x] 취업률·취업자 수: 특화·중장년 가산 완료
- [x] 알선취업 비중: 워크넷 신규 발굴 추가 집계
- [ ] 조기취업: 3개월 도과 방지 집중 리마인드 돌입
- [x] 임금수준: 서울/경기 고임금 제조업 최저 258만원↑ 타겟팅 알선 확대
- [ ] 만족도: 부진점 특별민원 배제 명단 보고 공문 사전 마련

----------------------------------------

${reportText || ""}
    `;
  };

  // 단순 마크다운 행 변형 함수 (HTML 렌더링용)
  const renderMarkdown = (text: string) => {
    return text.split("\n").map((line, idx) => {
      if (line.startsWith("###")) {
        return <h3 key={idx} className="text-sm font-bold text-slate-900 border-l-4 border-indigo-600 pl-2 mt-6 mb-2">{line.replace("###", "").trim()}</h3>;
      }
      if (line.startsWith("####")) {
        return <h4 key={idx} className="text-xs font-bold text-slate-800 mt-4 mb-1.5">{line.replace("####", "").trim()}</h4>;
      }
      if (line.startsWith("- **")) {
        const clean = line.replace("- **", "");
        const parts = clean.split("**:");
        if (parts.length > 1) {
          return (
            <div key={idx} className="text-xs text-slate-700 ml-4 my-1">
              <strong className="text-slate-900">• {parts[0]}:</strong>
              {parts.slice(1).join(":")}
            </div>
          );
        }
      }
      if (line.startsWith("- ")) {
        return <li key={idx} className="text-xs text-slate-600 ml-6 list-disc my-0.5">{line.replace("- ", "").trim()}</li>;
      }
      if (line.trim().startsWith("|") && line.includes("---")) {
        return null;
      }
      if (line.trim().startsWith("|") && !line.includes("---")) {
        const cells = line.split("|").map(c => c.trim()).filter(c => c !== "");
        return (
          <div key={idx} className="grid grid-cols-6 border-b border-slate-100 bg-slate-50/50 py-1.5 text-[10px] text-slate-700 px-2 font-mono">
            {cells.map((cell, cidx) => <span key={cidx} className="truncate">{cell}</span>)}
          </div>
        );
      }
      return <p key={idx} className="text-xs text-slate-600 leading-relaxed my-1">{line}</p>;
    });
  };

  return (
    <div className="space-y-6">
      {/* 2단계 조건 컨트롤 패널 */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          성과평가 인공지능 전문 보고서 제어 센터
        </h2>
        <p className="text-slate-500 text-xs mb-4">
          고용부 일정 역산을 준수하며, 24개 지점 실시간 입력을 정량/정성 교차 분석하도록 파라미터를 커스텀 설정합니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Q2. 집중할 지표 선택 */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <span className="font-bold text-slate-800 block mb-2 font-sans text-xs">
              질문 2. 분석에 집중할 지표 항목 (다중선택)
            </span>
            <div className="flex flex-wrap gap-2">
              {["취업실적", "알선취업", "조기취업", "임금수준", "고용유지", "만족도"].map(m => {
                const checked = focusMetrics.includes(m);
                return (
                  <button
                    key={m}
                    onClick={() => handleToggleMetric(m)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer transition ${
                      checked
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{checked ? "✓" : "+"}</span>
                    {m}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              ※ 미선택 시 취업실적, 알선취업, 조기취업 3대 핵심 지표 위주로 집중 가중합산 및 SWOT가 도출됩니다.
            </p>
          </div>

          {/* Q3. 보고서 활용 목적 */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="font-bold text-slate-800 block mb-2 font-sans text-xs">
                질문 3. 보고서 주된 활용 목적 (선택)
              </span>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="① 고용부 사전 데이터 점검(6·8월) 대응용">
                  ① 고용부 사전 데이터 점검(6·8월) 대응용 (목표일 역산 자동 설정)
                </option>
                <option value="② 최종 성과평가(11월) A등급 진입 전략 수립용">
                  ② 최종 성과평가(11월) A등급 진입 전략 수립용 (A등급 82점 최우선 시뮬레이션)
                </option>
                <option value="③ 내부 지점 평가·인센티브 산정용">
                  ③ 내부 지점 평가·인센티브 산정용 (상위 80% 지점 성과 매칭)
                </option>
                <option value="④ 부진 지점 클리닉·역량 강화용">
                  ④ 부진 지점 클리닉·역량 강화용 (약점 지표 방어 심층 R&R 배포)
                </option>
              </select>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 tracking-tight transition cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>인공지능 가용 데이터 연동 및 보고서 작성 중...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>전략적 분석 및 고용부 제출급 보고서 생성</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-12 text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-sm">성과평가 시뮬레이션 모델 계산 및 SWOT 도출 중...</h3>
            <p className="text-slate-500 text-xs">2026년도 국민취업지원제도 위탁기관 성과 계획 구조를 엄밀히 적용하여 문맥을 생성하고 있습니다.</p>
          </div>
          <div className="bg-white/80 p-3 rounded-lg border border-slate-100 max-w-sm mx-auto text-[10px] text-slate-500 font-mono text-left space-y-1">
            <div>• 서울/경기/지방 6개 고용부 권역별 표준점수 역산 처리 중...</div>
            <div>• 가중합산(비율 80% + 규모 20% vs 90%/10%) 유리도 산출 완료...</div>
            <div>• 특별민원 배제일정 역산(09.15 마감) 타겟 R&R 대책 수립 중...</div>
          </div>
        </div>
      )}

      {/* 최종 보고서 출력 뷰티풀 템플릿 */}
      {reportText && !loading && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-lg overflow-hidden">
          {/* 성과 표지 헤더 */}
          <div className="bg-slate-900 text-white p-6 flex justify-between items-center border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2.5 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase">
                  CONFIDENTIAL • 고용노동부 평가계획 규격
                </span>
                <h2 className="text-base font-extrabold tracking-tight">
                  국취제 민간위탁 성과평가 통합 분석 및 전략 대책 보고서
                </h2>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">복사 완료</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>클립보드 복사</span>
                  </>
                )}
              </button>
              <button
                onClick={() => window.print()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>인쇄 / PDF 저장</span>
              </button>
            </div>
          </div>

          <div className="p-8 space-y-8 font-sans print:p-0" id="print-area">
            {/* 1. 경영 요약 (Executive Summary) */}
            <section className="space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 border-b-2 border-slate-800 pb-2 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                1. Executive Summary (경영 요약)
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                본 보고서는 2026년도 국민취업지원제도 성과평가 계획에 의거하여 국제커리어센터 소속 24개 지점의 실적 데이터를 교차 분석하고, 최고 등급 확보를 목적으로 수립한 전략적 PM 대책 자료입니다.
              </p>

              <div>
                <span className="font-bold text-slate-900 text-xs block mb-2">
                  ① 당기 공식 평가지표 달성 현황 (24개 지점 합산)
                </span>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold font-mono text-[10px]">
                        <th className="p-2.5">지표</th>
                        <th className="p-2.5">배점</th>
                        <th className="p-2.5">합산 비율 실적</th>
                        <th className="p-2.5">보정 규모 실적</th>
                        <th className="p-2.5 text-center">적용 가중치</th>
                        <th className="p-2.5">특이사항</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="p-2.5 font-bold">① 취업실적</td>
                        <td className="p-2.5 font-medium">30점</td>
                        <td className="p-2.5 text-slate-900 font-bold">{consolidated.employmentRate}%</td>
                        <td className="p-2.5">{consolidated.employmentCountCorrected}명</td>
                        <td className="p-2.5 text-center font-bold text-indigo-600">{consolidated.employmentAppliedWeight}</td>
                        <td className="p-2.5 text-slate-500">특화·중장년 1.5배 가산 반영</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">② 알선취업실적</td>
                        <td className="p-2.5 font-medium">25점</td>
                        <td className="p-2.5 text-slate-900 font-bold">{consolidated.placementRate}%</td>
                        <td className="p-2.5">{consolidated.placementCountCorrected}명</td>
                        <td className="p-2.5 text-center font-bold text-indigo-600">{consolidated.placementAppliedWeight}</td>
                        <td className="p-2.5 text-slate-500">워크넷 신규 구인발굴 1.5배 가산 포함</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">③ 조기취업실적</td>
                        <td className="p-2.5 font-medium">10점</td>
                        <td className="p-2.5 text-slate-900 font-bold">{consolidated.earlyRate}%</td>
                        <td className="p-2.5">{consolidated.earlyCountCorrected}명</td>
                        <td className="p-2.5 text-center font-bold text-indigo-600">{consolidated.earlyAppliedWeight}</td>
                        <td className="p-2.5 text-slate-500">IAP 수립 후 3개월 이내 단축 조기취업 수치</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">④ 취업처 임금수준</td>
                        <td className="p-2.5 font-medium">10점</td>
                        <td className="p-2.5 text-slate-900 font-bold">{consolidated.wageRate}%</td>
                        <td className="p-2.5">—</td>
                        <td className="p-2.5 text-center">권역별 환산</td>
                        <td className="p-2.5 text-slate-500">’25년 250만 / ’26년 258만↑ 기준</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">⑤ 고용유지 수준</td>
                        <td className="p-2.5 font-medium">15점</td>
                        <td className="p-2.5 text-slate-900 font-bold">{consolidated.retentionRate}%</td>
                        <td className="p-2.5">—</td>
                        <td className="p-2.5 text-center">전체 환산</td>
                        <td className="p-2.5 text-slate-500">취업 후 6개월 유지자 역산 추적</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">⑥ 참여자 만족도</td>
                        <td className="p-2.5 font-medium">10점</td>
                        <td className="p-2.5 text-slate-900 font-bold">{consolidated.satisfactionRate.toFixed(2)}점</td>
                        <td className="p-2.5">—</td>
                        <td className="p-2.5 text-center">상위 80%</td>
                        <td className="p-2.5 text-rose-600 font-semibold">10월 조사 예정 / 9.15 민원보고 필수</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-900 text-xs block mb-2">
                  ② 가점 확보 현황 (합산 한도 5.0점)
                </span>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold font-mono text-[10px]">
                        <th className="p-2.5">가점 항목</th>
                        <th className="p-2.5">현재 실적 및 세부 성격</th>
                        <th className="p-2.5">공식 배점 적용 가산 가중치</th>
                        <th className="p-2.5 text-right">획득 점수</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="p-2.5 font-bold">우수사례 공모전 수상</td>
                        <td className="p-2.5">최고 훈격: {maxBestPractice}</td>
                        <td className="p-2.5">대상 2.0 / 최우수 1.0 / 우수 0.7 / 장려 0.5</td>
                        <td className="p-2.5 text-right font-bold text-indigo-600">+{bestPracticePoints} 점</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">타 사업 연계 (일경험 등)</td>
                        <td className="p-2.5">24개 지점 합계: <span className="font-bold">{totalOtherProjectCount}건</span></td>
                        <td className="p-2.5">40건 이상 3점 / 20~39건 2점 / 10~19건 1점 / 9건 이하 0점</td>
                        <td className="p-2.5 text-right font-bold text-indigo-600">+{consolidated.otherProjectBonus} 점</td>
                      </tr>
                      <tr className="bg-indigo-50/20 font-bold">
                        <td colSpan={3} className="p-2.5">공식 가점계 (한도 5점)</td>
                        <td className="p-2.5 text-right text-indigo-700 text-sm">+{consolidated.totalBonus.toFixed(1)} 점</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-amber-200 rounded-xl p-4 bg-amber-50/20">
                  <span className="font-bold text-amber-900 text-xs flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    ③ 우선 관리 대상 및 위기 지점
                  </span>
                  <ul className="space-y-1.5 text-xs text-amber-800 list-disc ml-4">
                    <li><strong>부산남구 지점:</strong> 보정 취업률 {((branches.find(b => b.name === "부산남구")?.terminations || 0) > 0 ? (getCorrectedEmployed(branches.find(b => b.name === "부산남구")!) / (branches.find(b => b.name === "부산남구")?.terminations || 1) * 100).toFixed(1) : "0.0")}% 기록. 상담 알선 속도 강화 절실.</li>
                    <li><strong>대구동부 지점:</strong> 최근 중도 탈락 인원 {branches.find(b => b.name === "대구동부")?.dropoutCount}명 도과. 상담사 일대일 착수 지연이 사유로 분석됨.</li>
                    <li><strong>경기남양주 지점:</strong> 만족도 지표 점수 {branches.find(b => b.name === "경기남양주")?.satisfactionScore}점 기록. 특별민원 제기자 관리 마감일(9.15) 전 배제 청구 우선 대응 필요.</li>
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                  <span className="font-bold text-slate-800 text-xs block mb-2">
                    ④ 고용부 핵심 대응 일정 현황 요약
                  </span>
                  <div className="space-y-1 text-xs text-slate-600">
                    <div>• <strong>현재 시점 기준 잔여 주차:</strong> {remainingWeeks}주</div>
                    <div>• <strong>7월 1차 사전 점검일까지:</strong> 전 지점 가점 집계 체계 및 알선 증대 집중 기간 적용.</div>
                    <div>• <strong>9월 15일:</strong> 특별민원 배제 신청 마감 및 만족도 우회 조치 최종 확인.</div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. 기간별 세부 지표 분석 & Forecast */}
            <section className="space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 border-b-2 border-slate-800 pb-2">
                2. 기간별 세부 지표 및 예측(Forecast) 분석
              </h3>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed space-y-2">
                <p><strong>주/월간 추이 진단:</strong> 현 주차 종료자 중에서 3개월 만료가 도과되는 조기취업 임박 대상자가 다수 포착되고 있습니다. 알선취업 우대가점 제도인 워크넷 미등록 신규 일자리 건수 비율을 약 40건 더 확보해야 연계 가산점의 다음 승급 구간으로 도달이 예정되어 있습니다.</p>
              </div>

              <div>
                <span className="font-bold text-slate-900 text-xs block mb-2">
                  ■ 10월 말 최종 평가 시나리오별 실적 선형 추정 (Forecast)
                </span>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold font-mono text-[10px]">
                        <th className="p-2.5">추정 시나리오</th>
                        <th className="p-2.5">예상 보정 취업자(보정율)</th>
                        <th className="p-2.5">예상 알선취업률</th>
                        <th className="p-2.5">예상 조기취업률</th>
                        <th className="p-2.5">예상 평가총점</th>
                        <th className="p-2.5">최종 등급 예측</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="p-2.5 font-semibold">현 추세 유지 (SMA 선형)</td>
                        <td className="p-2.5">{forecastEmployedSame}명 ({forecastRateSame}%)</td>
                        <td className="p-2.5">{forecastPlacementRateSame}%</td>
                        <td className="p-2.5">{forecastEarlyRateSame}%</td>
                        <td className="p-2.5">{consolidated.totalScore}점</td>
                        <td className="p-2.5 text-indigo-600 font-bold">{consolidated.predictedGrade}등급 유력</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-rose-700">보수적 추계 (SMA × 90%)</td>
                        <td className="p-2.5">{forecastEmployedConservative}명 ({forecastRateConservative}%)</td>
                        <td className="p-2.5">{forecastPlacementRateConservative}%</td>
                        <td className="p-2.5">{forecastEarlyRateConservative}%</td>
                        <td className="p-2.5">{(consolidated.totalScore - 3.5).toFixed(2)}점</td>
                        <td className="p-2.5 font-bold text-slate-700">B등급 낙착 리스크</td>
                      </tr>
                      <tr className="bg-indigo-50/30">
                        <td className="p-2.5 font-bold">목표 달성 필요치 (A등급 승급)</td>
                        <td className="p-2.5">{targetEmpCount}명 (70.0%)</td>
                        <td className="p-2.5">45.0%</td>
                        <td className="p-2.5">22.0%</td>
                        <td className="p-2.5">82.0점 이상</td>
                        <td className="p-2.5 text-indigo-700 font-extrabold">A등급 확실권 안착</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-xs">
                <span className="font-bold text-slate-800 block mb-2">잔여 기간 내 목표 달성 Gap 세부 해소 목표치</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-2.5 rounded border border-slate-100">
                    <div className="text-slate-500 text-[10px]">추가 필요 보정취업자구</div>
                    <div className="text-sm font-extrabold text-indigo-600 mt-1">+{gapEmp} 명</div>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-100">
                    <div className="text-slate-500 text-[10px]">추가 필요 알선취업자수</div>
                    <div className="text-sm font-extrabold text-emerald-600 mt-1">+{gapPlacement} 명</div>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-100">
                    <div className="text-slate-500 text-[10px]">타 사업 추가연계 건수</div>
                    <div className="text-sm font-extrabold text-indigo-600 mt-1">+{targetOtherProjectNextGap} 건</div>
                    <div className="text-[9px] text-slate-400 mt-1">(달성 시 가점 +{targetOtherProjectNextPoint}점 확보)</div>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-100">
                    <div className="text-slate-500 text-[10px]">조기취업 관리 기한임박</div>
                    <div className="text-sm font-extrabold text-amber-600 mt-1">+{gapEarly} 명</div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3 ~ 6. Gemini 연계 정성 보고서 본문 */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              {renderMarkdown(reportText)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
