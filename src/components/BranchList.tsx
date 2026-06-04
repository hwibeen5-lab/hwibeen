import React, { useState } from "react";
import { BranchStats } from "../types";
import { getCorrectedEmployed, getCorrectedPlacement, getCorrectedEarly } from "../utils";
import { SAMPLE_BRANCHESTATS, getEmptyBranchStats } from "../data";
import { Search, Edit3, Trash2, RotateCcw, AlertCircle, Sparkles, SlidersHorizontal, Check } from "lucide-react";

interface Props {
  branches: BranchStats[];
  onUpdateBranches: (newBranches: BranchStats[]) => void;
}

export default function BranchList({ branches, onUpdateBranches }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [editingBranch, setEditingBranch] = useState<BranchStats | null>(null);
  const [bulkTextInput, setBulkTextInput] = useState("");
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkError, setBulkError] = useState("");

  const regions = ["전체", "서울", "경기", "중부(인천)", "대구(경북)", "대전(충청·세종)", "부산(경남·울산)"];

  const filteredBranches = branches.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === "전체" || b.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const handleLoadSample = () => {
    if (window.confirm("기존의 모든 지점 데이터가 샘플 데이터로 대체됩니다. 진행하시겠습니까?")) {
      onUpdateBranches(JSON.parse(JSON.stringify(SAMPLE_BRANCHESTATS)));
    }
  };

  const handleResetEmpty = () => {
    if (window.confirm("모든 지점 실적 데이터를 0으로 초기화하시겠습니까?")) {
      onUpdateBranches(getEmptyBranchStats());
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch) return;

    const updated = branches.map(b => (b.name === editingBranch.name ? editingBranch : b));
    onUpdateBranches(updated);
    setEditingBranch(null);
  };

  // 대량 텍스트 파싱 처리 (CSV 또는 복사해서 붙여넣기 대응)
  const handleBulkParse = () => {
    try {
      setBulkError("");
      if (!bulkTextInput.trim()) {
        setBulkError("붙여넣은 텍스트가 비어 있습니다.");
        return;
      }

      // 대량 텍스트 파싱 로직
      // 형식: [지점명][\t 또는 ,][종료자][\t 또는 ,][취업자] ...
      // 24개 지명 식별 매칭 Rule 적용
      const lines = bulkTextInput.trim().split("\n");
      const updatedBranches = [...branches];
      let matchCount = 0;

      lines.forEach(line => {
        const parts = line.split(/[\t,]+/);
        if (parts.length < 2) return;
        const branchName = parts[0].trim();
        
        // 지명 식별
        const targetIdx = updatedBranches.findIndex(b => b.name === branchName);
        if (targetIdx !== -1) {
          matchCount++;
          const terminations = parseInt(parts[1]) || 0;
          const employedRaw = parseInt(parts[2]) || 0;
          const employedSpecial = parseInt(parts[3]) || 0;
          const employedExcluded = parseInt(parts[4]) || 0;
          const jobPlacementRaw = parseInt(parts[5]) || 0;
          const jobPlacementNew = parseInt(parts[6]) || 0;
          const earlyEmployedRaw = parseInt(parts[7]) || 0;
          const earlyEmployedSpecial = parseInt(parts[8]) || 0;
          const wageQualified2026 = parseInt(parts[9]) || 0;
          const wageTotal2026 = parseInt(parts[10]) || 0;
          const retention6Months = parseInt(parts[11]) || 0;
          const satisfactionScore = parseFloat(parts[12]) || 0;

          updatedBranches[targetIdx] = {
            ...updatedBranches[targetIdx],
            terminations,
            employedRaw,
            employedSpecial,
            employedExcluded,
            jobPlacementRaw,
            jobPlacementNew,
            earlyEmployedRaw,
            earlyEmployedSpecial,
            wageQualified2025: 0, // '26년 임의 기준선택
            wageQualified2026,
            wageTotal2025: 0,
            wageTotal2026,
            retention6Months,
            satisfactionScore: Math.min(10, Math.max(0, satisfactionScore))
          };
        }
      });

      if (matchCount === 0) {
        setBulkError("제시된 24개 지점명과 일치하는 행을 발견하지 못했습니다.");
        return;
      }

      onUpdateBranches(updatedBranches);
      setShowBulkModal(false);
      setBulkTextInput("");
      alert(`${matchCount}개 지점의 데이터가 정상적으로 매칭 파싱되었습니다!`);
    } catch (err: any) {
      setBulkError(`파싱 에러: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* 컨트롤 패널 */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
            24개 소속 지점 실적 입력 및 시뮬레이션
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            개별 지점 명단을 클릭해 실적 수치를 변경하고 즉시 전체 등급 변화를 시뮬레이션할 수 있습니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleLoadSample}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            샘플 데이터 로드
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5"
          >
            엑셀/CVS 대량 붙여넣기
          </button>
          <button
            onClick={handleResetEmpty}
            className="border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            0으로 초기화
          </button>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="지점명 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {regions.map(r => (
            <button
              key={r}
              onClick={() => setSelectedRegion(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedRegion === r
                  ? "bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 지점 리스트 테이블 */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold">
                <th className="p-4">지점명 (권역)</th>
                <th className="p-4">종료자 수</th>
                <th className="p-4">보정 취업 (취업률)</th>
                <th className="p-4">보정 알선 (알선율)</th>
                <th className="p-4">보정 조기 (조기율)</th>
                <th className="p-4">임금 충족 비중</th>
                <th className="p-4">고용유지 (6개월)</th>
                <th className="p-4">만족도</th>
                <th className="p-4 text-center">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 text-xs">
                    검색 조건에 맞는 지점이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredBranches.map(b => {
                  const denom = Math.max(1, b.terminations);
                  const empC = getCorrectedEmployed(b);
                  const placeC = getCorrectedPlacement(b);
                  const earlyC = getCorrectedEarly(b);

                  const empRate = ((empC / denom) * 100).toFixed(1);
                  const placeRate = ((placeC / denom) * 100).toFixed(1);
                  const earlyRate = ((earlyC / denom) * 100).toFixed(1);

                  const wageTot = Math.max(1, b.wageTotal2025 + b.wageTotal2026);
                  const wageRate = (((b.wageQualified2025 + b.wageQualified2026) / wageTot) * 100).toFixed(1);

                  const retentionTot = Math.max(1, b.employedRaw - b.employedExcluded);
                  const retentionRate = ((b.retention6Months / retentionTot) * 100).toFixed(1);

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{b.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{b.region} 권역</div>
                      </td>
                      <td className="p-4 font-semibold text-slate-800">{b.terminations}명</td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900">{empRate}%</span>
                        <div className="text-[10px] text-slate-500 mt-0.5">보정: {Math.round(empC)}명</div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-800">{placeRate}%</span>
                        <div className="text-[10px] text-slate-500 mt-0.5">보정: {Math.round(placeC)}명</div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-800">{earlyRate}%</span>
                        <div className="text-[10px] text-slate-500 mt-0.5">보정: {Math.round(earlyC)}명</div>
                      </td>
                      <td className="p-4 font-medium text-slate-800">{wageRate}%</td>
                      <td className="p-4">
                        <span className="font-medium text-slate-800">{retentionRate}%</span>
                        <div className="text-[10px] text-slate-500 mt-0.5">유지: {b.retention6Months}명</div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-amber-600">{b.satisfactionScore.toFixed(1)}</span>
                        <span className="text-[10px] text-slate-400"> / 10점</span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setEditingBranch(JSON.parse(JSON.stringify(b)))}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-md text-xs font-semibold inline-flex items-center gap-1 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          수정
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 개별 지점 상세 편집 모달 / 슬라이드 오버 */}
      {editingBranch && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-lg h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    [{editingBranch.name}] 실적 시뮬레이션 설정
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">{editingBranch.region} 권역 소속</p>
                </div>
                <button
                  onClick={() => setEditingBranch(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 py-4 text-xs">
                {/* 1. 종료자 */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    종료자 수 (분모 — 타 법인 이관종료 제외)
                  </label>
                  <input
                    type="number"
                    value={editingBranch.terminations}
                    onChange={(e) => setEditingBranch({ ...editingBranch, terminations: parseInt(e.target.value) || 0 })}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">※ 동일 법인 간 이관은 포함하고, 타 법인 이관 종료자는 반드시 제외해야 합니다.</p>
                </div>

                {/* 2. 취업자 분자 구성원 */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-2">취업자 상세 세부사항 (분자)</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">일반 취업자수</label>
                      <input
                        type="number"
                        value={editingBranch.employedRaw}
                        onChange={(e) => setEditingBranch({ ...editingBranch, employedRaw: parseInt(e.target.value) || 0 })}
                        className="w-full border border-slate-200 bg-white rounded-lg p-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        특화/중장년 (1.5 가산)
                      </label>
                      <input
                        type="number"
                        value={editingBranch.employedSpecial}
                        onChange={(e) => setEditingBranch({ ...editingBranch, employedSpecial: parseInt(e.target.value) || 0 })}
                        className="w-full border border-slate-200 bg-white rounded-lg p-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        파견/자체 (제외자)
                      </label>
                      <input
                        type="number"
                        value={editingBranch.employedExcluded}
                        onChange={(e) => setEditingBranch({ ...editingBranch, employedExcluded: parseInt(e.target.value) || 0 })}
                        className="w-full border border-slate-200 bg-white rounded-lg p-1.5 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. 알선취업 */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-2">알선취업 상세 수치</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">일반 알선취업 수</label>
                      <input
                        type="number"
                        value={editingBranch.jobPlacementRaw}
                        onChange={(e) => setEditingBranch({ ...editingBranch, jobPlacementRaw: parseInt(e.target.value) || 0 })}
                        className="w-full border border-slate-200 bg-white rounded-lg p-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        신규발굴 알선 (1.5 우대)
                      </label>
                      <input
                        type="number"
                        value={editingBranch.jobPlacementNew}
                        onChange={(e) => setEditingBranch({ ...editingBranch, jobPlacementNew: parseInt(e.target.value) || 0 })}
                        className="w-full border border-slate-200 bg-white rounded-lg p-1.5 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. 조기취업 */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-2">조기취업 수치 (IAP 후 3개월)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">조기취업 수</label>
                      <input
                        type="number"
                        value={editingBranch.earlyEmployedRaw}
                        onChange={(e) => setEditingBranch({ ...editingBranch, earlyEmployedRaw: parseInt(e.target.value) || 0 })}
                        className="w-full border border-slate-200 bg-white rounded-lg p-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        특화/중장년 조기 (1.5 가산)
                      </label>
                      <input
                        type="number"
                        value={editingBranch.earlyEmployedSpecial}
                        onChange={(e) => setEditingBranch({ ...editingBranch, earlyEmployedSpecial: parseInt(e.target.value) || 0 })}
                        className="w-full border border-slate-200 bg-white rounded-lg p-1.5 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. 임금수준 및 고용유지, 만족도 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      2026년 최저 120%↑ 취업자 수
                    </label>
                    <input
                      type="number"
                      value={editingBranch.wageQualified2026}
                      onChange={(e) => setEditingBranch({ ...editingBranch, wageQualified2026: parseInt(e.target.value) || 0 })}
                      className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      2026년 전체 임금추적 취업자 수
                    </label>
                    <input
                      type="number"
                      value={editingBranch.wageTotal2026}
                      onChange={(e) => setEditingBranch({ ...editingBranch, wageTotal2026: parseInt(e.target.value) || 0 })}
                      className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      6개월 고용상태 유지자 수
                    </label>
                    <input
                      type="number"
                      value={editingBranch.retention6Months}
                      onChange={(e) => setEditingBranch({ ...editingBranch, retention6Months: parseInt(e.target.value) || 0 })}
                      className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      참여자 만족도 (10점 만점)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      max="10"
                      min="0"
                      value={editingBranch.satisfactionScore}
                      onChange={(e) => setEditingBranch({ ...editingBranch, satisfactionScore: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-slate-200 rounded-lg p-2 text-sm text-yellow-700 font-bold"
                    />
                  </div>
                </div>

                {/* 6. 가점 및 내부 관리 항목 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">타 사업 연계 건수</label>
                    <input
                      type="number"
                      value={editingBranch.otherProjectLinkedCount}
                      onChange={(e) => setEditingBranch({ ...editingBranch, otherProjectLinkedCount: parseInt(e.target.value) || 0 })}
                      className="w-full border border-slate-200 rounded-lg p-2 text-sm text-indigo-700 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">우수사례 정부 포상</label>
                    <select
                      value={editingBranch.bestPracticeAward}
                      onChange={(e) => setEditingBranch({ ...editingBranch, bestPracticeAward: e.target.value as any })}
                      className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                    >
                      <option value="none">없음 (0점)</option>
                      <option value="normal">장려상 (0.5점)</option>
                      <option value="excellent">우수상 (0.7점)</option>
                      <option value="best">최우수상 (1.0점)</option>
                      <option value="target">대상 (2.0점)</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => setEditingBranch(null)}
                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl font-bold text-xs"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                적용 및 저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 엑셀 대량 복사 붙여넣기 모달 */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dynamic-shadow w-full max-w-2xl rounded-2xl border border-slate-200 p-6 flex flex-col max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                엑셀 / CSV 복사해서 붙여넣기
              </h3>
              <button
                onClick={() => { setShowBulkModal(false); setBulkError(""); }}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <div className="py-4 text-xs space-y-3">
              <div className="bg-slate-50 text-slate-600 p-3 rounded-lg border border-slate-150">
                <p className="font-bold text-slate-800">📋 사용안내 및 열 구성:</p>
                <p className="mt-1">
                  엑셀 시트에서 아래 열 순서로 지점들의 값을 드래그 복사해서 아래 입력창에 바로 붙여넣기 하시면 일괄로 입력됩니다.
                  (구분자는 탭 또는 쉼표를 인식합니다.)
                </p>
                <p className="font-mono text-indigo-700 mt-2 font-bold select-all bg-indigo-50 p-1.5 rounded">
                  지점명 종료자 취업자 특화취업 제외취업 일반알선 신규알선 일반조기 특화조기 26충족 26전체 고용유지 만족도
                </p>
                <p className="mt-1.5 text-amber-600">
                  ⚠️ 주의: 제일 첫 열의 <strong>지점명</strong>은 명단상의 24개 고정 지점명(예: 서울강남, 경기안산, 울산지점 등)과 완벽매칭되어야 파싱 처리됩니다!
                </p>
              </div>

              <textarea
                placeholder="여기에 행 데이터를 복사해 붙여넣어 주세요...
예 :
경기성남&#9;135&#9;75&#9;30&#9;3&#9;45&#9;18&#9;24&#9;9&#9;58&#9;82&#9;81&#9;9.5
서울강남&#9;120&#9;65&#9;25&#9;2&#9;35&#9;15&#9;18&#9;8&#9;45&#9;70&#9;68&#9;9.4"
                rows={9}
                value={bulkTextInput}
                onChange={(e) => setBulkTextInput(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />

              {bulkError && (
                <div className="bg-rose-50 text-rose-700 p-2.5 rounded-lg text-[11px] font-semibold flex items-start gap-1.5 border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{bulkError}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs">
              <button
                onClick={() => { setShowBulkModal(false); setBulkError(""); }}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 cursor-pointer"
              >
                닫기
              </button>
              <button
                onClick={handleBulkParse}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg cursor-pointer"
              >
                파싱 및 대체 적용
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
