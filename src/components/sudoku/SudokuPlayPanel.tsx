'use client';

import React from 'react';
import { SudokuGrid } from '@/components/sudoku/SudokuGrid';
import { Eraser, Pencil, PenTool } from 'lucide-react';

export interface SudokuPlayPanelProps {
  board: number[][];
  initialBoard: number[][];
  notes: number[][][];
  duplicates: boolean[][];
  selected: { r: number; c: number } | null;
  isNoteMode: boolean;
  onSelectCell: (r: number, c: number) => void;
  onToggleNoteMode: (noteMode: boolean) => void;
  onInputNumber: (num: number) => void;
}

export function SudokuPlayPanel({
  board,
  initialBoard,
  notes,
  duplicates,
  selected,
  isNoteMode,
  onSelectCell,
  onToggleNoteMode,
  onInputNumber,
}: SudokuPlayPanelProps) {
  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* 9x9 盤面 */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-6 lg:col-span-7">
        <SudokuGrid
          board={board}
          initialBoard={initialBoard}
          notes={notes}
          duplicates={duplicates}
          selected={selected}
          onSelectCell={onSelectCell}
          ariaLabel="ナンプレ盤面"
          showLegend={true}
        />
      </div>

      {/* 操作パネル（入力モード切替 & 数字パッド） */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 lg:col-span-5">
        <div className="space-y-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              入力モード切り替え
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              キーボード（1〜9、矢印キー、BackSpace、Mキー）でも操作できます
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1.5">
              <button
                type="button"
                onClick={() => onToggleNoteMode(false)}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-bold transition sm:text-sm ${
                  !isNoteMode
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PenTool className="h-4 w-4" />
                <span>本番数字入力</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleNoteMode(true)}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-bold transition sm:text-sm ${
                  isNoteMode
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Pencil className="h-4 w-4" />
                <span>候補メモ入力</span>
              </button>
            </div>
          </div>

          {/* 数字パッド 1〜9 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                数字パッド（{isNoteMode ? 'メモ仮置き' : '本番入力'}）
              </span>
              <span className="text-[11px] text-slate-400">
                選択位置:{' '}
                {selected
                  ? `${selected.r + 1}行 ${selected.c + 1}列`
                  : '未選択'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                let placedCount = 0;
                for (let r = 0; r < 9; r++) {
                  for (let c = 0; c < 9; c++) {
                    if (board[r]?.[c] === num) placedCount++;
                  }
                }

                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => onInputNumber(num)}
                    className={`flex flex-col items-center justify-center rounded-xl border py-3 transition active:scale-95 ${
                      isNoteMode
                        ? 'border-amber-200 bg-amber-50/60 text-amber-900 hover:bg-amber-100'
                        : 'border-slate-200 bg-slate-50 text-slate-900 hover:border-sky-300 hover:bg-sky-50'
                    }`}
                  >
                    <span className="text-xl font-bold">{num}</span>
                    <span className="text-[10px] text-slate-400">
                      残り {Math.max(0, 9 - placedCount)}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => onInputNumber(0)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-100 sm:text-sm"
            >
              <Eraser className="h-4 w-4 text-slate-500" />
              <span>選択マスの数字・メモを消去</span>
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-600">
          <strong className="font-bold text-slate-800">クリア条件：</strong>
          全81マスを1〜9で埋め、タテ・ヨコ・3×3ブロックの重複（赤字）が0件になった瞬間にクリアとなります！
        </div>
      </div>
    </section>
  );
}
