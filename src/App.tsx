import React, { useState } from "react";
import { BranchStats, CompetitorStats, DEFAULT_COMPETITOR_STATS } from "./types";
import { SAMPLE_BRANCHESTATS } from "./data";
import LandingView from "./components/LandingView";
import DashboardView from "./components/DashboardView";
import BranchList from "./components/BranchList";
import ReportGenerator from "./components/ReportGenerator";
import CompetitorSettings from "./components/CompetitorSettings";
import { LayoutDashboard, Sliders, FileSpreadsheet, Settings, Building2, Home, Lock } from "lucide-react";

export default function App() {
  const [branches, setBranches] = useState<BranchStats[]>(() => {
    // 깊은 복사로 초기 데이터 보존
    return JSON.parse(JSON.stringify(SAMPLE_BRANCHESTATS));
  });

  const [competitorStats, setCompetitorStats] = useState<CompetitorStats>(() => {
    return JSON.parse(JSON.stringify(DEFAULT_COMPETITOR_STATS));
  });

  const [activeTab, setActiveTab] = useState<"home" | "dashboard" | "branches" | "report" | "settings">("home");

  const [hasApiKey, setHasApiKey] = useState<boolean>(() => {
    return !!localStorage.getItem("GEMINI_API_KEY");
  });

  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleTabChange = (tab: "home" | "dashboard" | "branches" | "report" | "settings") => {
    // Check key presence directly in localStorage to support real-time state additions/removals
    const currentKey = localStorage.getItem("GEMINI_API_KEY");
    if (tab !== "home" && !currentKey) {
      setAlertMessage("🔒 Gemini API 키가 유효하지 않거나 미등록 상태입니다. 다른 메뉴(대시보드, 지부 실적, 분석 보고서)를 가동하시려면 홈 화면 하단에서 API Key를 등록 및 인증해 주세요.");
      setActiveTab("home");
      
      // Update our reactive state
      setHasApiKey(false);

      // Smooth scroll to API key input on home page
      setTimeout(() => {
        const target = document.getElementById("api-key-section");
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 150);

      // Clear alert after some time
      setTimeout(() => {
        setAlertMessage((prev) => 
          prev && prev.includes("Gemini API 키") ? null : prev
        );
      }, 8000);
      return;
    }

    // Set matching API key state
    setHasApiKey(!!currentKey);
    setActiveTab(tab);
    setAlertMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased flex flex-col font-sans">
      {/* 1. 최상단 내비게이션 바 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 법인 로고 및 시스템명 */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-slate-900 to-indigo-900 text-white p-2.5 rounded-xl shadow-md">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 tracking-tight text-base">
                    국제커리어센터
                  </span>
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-indigo-100">
                    PM 포털
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  2026 국취제 민간위탁 성과평가 통합 통계망
                </div>
              </div>
            </div>

            {/* 일정 리얼타임 타임라인 배지 */}
            <div className="hidden md:flex items-center gap-2 bg-indigo-50/55 p-2 rounded-lg border border-indigo-100 text-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
              <span className="text-indigo-900 font-semibold flex items-center gap-1">
                7월 고용부 1차 사전 점검 데이터 오픈 임박 (시뮬레이션 가동 중)
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. 메인 서브헤더 앤 탭 선택 영역 */}
      <div className="bg-white border-b border-slate-200/80 sticky top-16 z-30 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto space-x-1 py-2">
            <button
              onClick={() => handleTabChange("home")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === "home"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200"
              }`}
            >
              <Home className="w-4 h-4" />
              포털 웰컴 홈
            </button>

            <button
              onClick={() => handleTabChange("dashboard")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200"
              } ${!hasApiKey ? "text-slate-400" : ""}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>통합 경영대시보드</span>
              {!hasApiKey && (
                <Lock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              )}
            </button>

            <button
              onClick={() => handleTabChange("branches")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === "branches"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200"
              } ${!hasApiKey ? "text-slate-400" : ""}`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>24개 지점 실적 & 시뮬레이션</span>
              {!hasApiKey && (
                <Lock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              )}
            </button>

            <button
              onClick={() => handleTabChange("report")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === "report"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200"
              } ${!hasApiKey ? "text-slate-400" : ""}`}
            >
              <Sliders className="w-4 h-4" />
              <span>성과분석 & 인공지능 보고서</span>
              {!hasApiKey && (
                <Lock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              )}
            </button>

            <button
              onClick={() => handleTabChange("settings")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeTab === "settings"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200"
              } ${!hasApiKey ? "text-slate-400" : ""}`}
            >
              <Settings className="w-4 h-4" />
              <span>전국 경쟁기관 평균 설정</span>
              {!hasApiKey && (
                <Lock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 경고 알림 바 */}
      {alertMessage && (
        <div className="bg-rose-50 border-y border-rose-100 py-3 px-4 print:hidden animate-fade-in">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-sm text-rose-800 font-semibold gap-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2 w-2 relative shrink-0 animate-pulse">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-bounce"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-650"></span>
              </span>
              <span>{alertMessage}</span>
            </div>
            <button 
              onClick={() => setAlertMessage(null)}
              className="text-rose-500 hover:text-rose-700 font-bold cursor-pointer bg-rose-100/80 hover:bg-rose-100 rounded px-2.2 py-0.5 text-xs transition"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 3. 콘텐츠 뷰 세션 */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div>
          {activeTab === "home" && (
            <LandingView 
              branches={branches} 
              competitorStats={competitorStats} 
              onNavigate={handleTabChange} 
              onApiKeyVerified={() => setHasApiKey(true)}
              onApiKeyRemoved={() => setHasApiKey(false)}
            />
          )}

          {activeTab === "dashboard" && (
            <DashboardView branches={branches} competitorStats={competitorStats} />
          )}

          {activeTab === "branches" && (
            <BranchList branches={branches} onUpdateBranches={setBranches} />
          )}

          {activeTab === "report" && (
            <ReportGenerator branches={branches} competitorStats={competitorStats} />
          )}

          {activeTab === "settings" && (
            <CompetitorSettings competitorStats={competitorStats} onUpdateStats={setCompetitorStats} />
          )}
        </div>
      </main>

      {/* 4. 최하단 푸터 */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400 text-[10px]">
          <div>© 2026 국제커리어센터 법인본부 기획제도운영팀. All rights reserved.</div>
          <div className="mt-1">국민취업지원제도 성과평가 계획 공식 표준점수 알고리즘을 준용하여 설계된 특화 모니터링 시스템입니다.</div>
        </div>
      </footer>
    </div>
  );
}
