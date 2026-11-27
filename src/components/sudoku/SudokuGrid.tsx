'use client';

import React from 'react';

export interface SudokuGridProps {
  board: number[][];
  initialBoard?: number[][];
  notes?: number[][][];
  ghostBoard?: number[][];
  duplicates: boolean[][];
  selected: { r: number; c: number } | null;
  onSelectCell: (r: number, c: number) => void;
  ariaLabel?: string;
  showLegend?: boolean;
}

/**
 * プレイ画面・作成画面共通の9x9ナンプレ盤面コンポーネント
 * - 選択マス: bg-sky-300 ring-2 ring-sky-600 z-10
 * - 同一数字: bg-sky-200
 * - 同一タテ・ヨコライン: bg-sky-50
 * - 重複数字: text-red-600 font-bold
 */
export function SudokuGrid({
  board,
  initialBoard,
  notes,
  ghostBoard,
  duplicates,
  selected,
  onSelectCell,
  ariaLabel = 'ナンプレ盤面',
  showLegend = true,
}: SudokuGridProps) {
  const selectedVal = selected ? board[selected.r]?.[selected.c] ?? 0 : 0;

  return (
    <div className="flex w-full flex-col items-center">
      <div
        className="grid aspect-square w-full max-w-[432px] grid-cols-9 border-2 border-slate-800 bg-slate-800 select-none"
        role="grid"
        aria-label={ariaLabel}
      >
        {board.map((row, r) =>
          row.map((val, c) => {
            const isInitial = initialBoard ? initialBoard[r]?.[c] !== 0 : false;
            const isSelected = selected?.r === r && selected?.c === c;
            const isSameLine =
              selected !== null && (selected.r === r || selected.c === c);
            const isSameNumber =
              val !== 0 && selectedVal !== 0 && val === selectedVal;
            const isDuplicate = duplicates[r]?.[c] ?? false;
            const cellNotes = notes?.[r]?.[c] ?? [];
            const ghostVal = ghostBoard?.[r]?.[c] ?? 0;

            let bgClass = isInitial
              ? 'bg-slate-100/90'
              : val !== 0
                ? 'bg-white'
                : 'bg-white';
            if (isSameLine) {
              bgClass = 'bg-sky-50';
            }
            if (isSameNumber) {
              bgClass = 'bg-sky-200';
            }
            if (isSelected) {
              bgClass = 'bg-sky-300 ring-2 ring-sky-600 z-10';
            }

            const borderRight =
              c === 2 || c === 5
                ? 'border-r-2 border-r-slate-800'
                : c < 8
                  ? 'border-r border-r-slate-300'
                  : '';
            const borderBottom =
              r === 2 || r === 5
                ? 'border-b-2 border-b-slate-800'
                : r < 8
                  ? 'border-b border-b-slate-300'
                  : '';

            let textClass = isInitial
              ? 'text-slate-900 font-extrabold'
              : initialBoard
                ? 'text-sky-700 font-semibold'
                : 'text-slate-900 font-bold';
            if (isDuplicate) {
              textClass = 'text-red-600 font-bold';
            }

            return (
              <button
                key={`${r}-${c}`}
                type="button"
                onClick={() => onSelectCell(r, c)}
                className={`relative flex aspect-square items-center justify-center transition-colors focus:outline-none ${bgClass} ${borderRight} ${borderBottom}`}
                aria-label={`${r + 1}行${c + 1}列 ${
                  val ? `数字${val}` : '空白'
                }`}
              >
                {val !== 0 ? (
                  <span className={`text-lg sm:text-2xl ${textClass}`}>
                    {val}
                  </span>
                ) : cellNotes.length > 0 ? (
                  <div className="grid h-full w-full grid-cols-3 grid-rows-3 p-0.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <span
                        key={n}
                        className={`flex items-center justify-center text-[9px] leading-none sm:text-[10px] ${
                          cellNotes.includes(n)
                            ? n === selectedVal
                              ? 'font-bold text-sky-700'
                              : 'font-medium text-slate-500'
                            : 'opacity-0'
                        }`}
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                ) : ghostVal !== 0 ? (
                  <span className="text-[10px] text-slate-300">{ghostVal}</span>
                ) : null}
              </button>
            );
          })
        )}
      </div>

      {showLegend && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-xs bg-sky-300 ring-1 ring-sky-600" />
            選択マス
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-xs bg-sky-200" />
            同じ数字
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-xs border border-slate-200 bg-sky-50" />
            タテ・ヨコ列
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="font-bold text-red-600">赤字</span>
            重複
          </span>
        </div>
      )}
    </div>
  );
}
