'use client';

import React from 'react';
import { SudokuGrid } from '@/components/sudoku/SudokuGrid';
import { SudokuValidationResult } from '@/utils/sudokuLogic';
import {
  AlertCircle,
  CheckCircle2,
  Eraser,
  RefreshCw,
  Send,
  Sparkles,
  Wand2,
} from 'lucide-react';

export type SudokuCreateMode = 'carve' | 'free';

export interface SudokuCreatorProps {
  mode: SudokuCreateMode;
  board: number[][];
  carveBaseSolution: number[][];
  duplicates: boolean[][];
  validation: SudokuValidationResult;
  selected: { r: number; c: number };
  submitError: string | null;
  isSubmitting: boolean;
  onSwitchMode: (mode: SudokuCreateMode) => void;
  onCellClick: (r: number, c: number) => void;
  onRegenerateCarveBase: (withAutoHoles: boolean) => void;
  onFreeInput: (num: number) => void;
  onResetFreeBoard: () => void;
  onPublish: (e: React.FormEvent) => void;
}

export function SudokuCreator({
  mode,
  board,
  carveBaseSolution,
  duplicates,
  validation,
  selected,
  submitError,
  isSubmitting,
  onSwitchMode,
  onCellClick,
  onRegenerateCarveBase,
  onFreeInput,
  onResetFreeBoard,
  onPublish,
}: SudokuCreatorProps) {
  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* 左カラム：9x9盤面 */}
      <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-6 lg:col-span-7">
        {/* 作成モード2タブ切り替え */}
        <div className="mb-4 grid w-full grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1.5">
          <button
            type="button"
            onClick={() => onSwitchMode('carve')}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition ${
              mode === 'carve'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wand2 className="h-3.5 w-3.5" />
            <span>ランダム生成から穴あけ</span>
          </button>

          <button
            type="button"
            onClick={() => onSwitchMode('free')}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition ${
              mode === 'free'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>白紙から自由入力</span>
          </button>
        </div>

        <p className="mb-3 text-center text-xs text-slate-500">
          {mode === 'carve'
            ? 'マスをタップすると「空白（穴あけ）」と「元の完成数字」が切り替わります。'
            : 'マスを選択して、右の数字パッドまたはキーボード（1〜9）で初期配置数字を入力してください。'}
        </p>

        <SudokuGrid
          board={board}
          ghostBoard={mode === 'carve' ? carveBaseSolution : undefined}
          duplicates={duplicates}
          selected={selected}
          onSelectCell={onCellClick}
          ariaLabel="ナンプレ作成盤面"
          showLegend={true}
        />
      </div>

      {/* 右カラム：唯一解バリデーション状況 & モード別操作パネル */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 lg:col-span-5">
        <div className="space-y-5">
          {/* 唯一解リアルタイム判定ステータス */}
          <div
            className={`rounded-2xl border p-4 ${
              validation.status === 'unique'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border-rose-200 bg-rose-50 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-bold">
              {validation.status === 'unique' ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
              )}
              <span>
                {validation.status === 'unique'
                  ? '唯一解チェック：OK（公開可能）'
                  : '唯一解チェック：NG（公開不可）'}
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed">
              {validation.message}
            </p>
          </div>

          {mode === 'carve' ? (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-900">
                ランダム生成・穴あけツール
              </h2>
              <p className="text-xs leading-relaxed text-slate-600">
                盤面のマスをタップして空白（穴）を増やしたり戻したりできます。薄い数字は元の解答数字の控えです。
              </p>

              <div className="grid grid-cols-1 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => onRegenerateCarveBase(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs font-bold text-sky-700 transition hover:bg-sky-100"
                >
                  <Wand2 className="h-4 w-4" />
                  <span>新しい盤面を生成して自動で唯一解の穴をあける</span>
                </button>

                <button
                  type="button"
                  onClick={() => onRegenerateCarveBase(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>穴なしの完成盤面から自分で1マスずつ穴をあける</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">
                  数字入力パッド（白紙から自由入力）
                </h2>
                <button
                  type="button"
                  onClick={onResetFreeBoard}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  全マスリセット
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => onFreeInput(n)}
                    className="rounded-xl border border-slate-200 bg-slate-50 py-3 text-lg font-bold text-slate-900 transition hover:border-sky-300 hover:bg-sky-50"
                  >
                    {n}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => onFreeInput(0)}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                <Eraser className="h-4 w-4" />
                <span>選択マスを空白（0）にする</span>
              </button>
            </div>
          )}
        </div>

        {/* 公開ボタン */}
        <div className="mt-6 border-t border-slate-100 pt-5">
          {submitError && (
            <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
              {submitError}
            </div>
          )}

          <button
            type="button"
            disabled={isSubmitting || validation.status !== 'unique'}
            onClick={onPublish}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-sm transition ${
              validation.status === 'unique' && !isSubmitting
                ? 'bg-sky-600 hover:bg-sky-700 active:scale-[0.99]'
                : 'cursor-not-allowed bg-slate-300 text-slate-500'
            }`}
          >
            <Send className="h-4 w-4" />
            <span>
              {isSubmitting
                ? '公開処理中...'
                : 'このナンプレを公開する（唯一解確認済み）'}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
