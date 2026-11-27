'use client';

import React from 'react';
import { CrosswordCell, CrosswordClue } from '@/types/puzzle';
import { AutoNumberResult } from '@/utils/crosswordLogic';
import { CrosswordInputBox } from '@/components/crossword/CrosswordInputBox';
import {
  AlertCircle,
  ArrowRightLeft,
  CheckCircle2,
  Send,
  Sparkles,
  Square,
  Type,
} from 'lucide-react';

export interface CrosswordCreatorProps {
  rows: number;
  cols: number;
  rawGrid: CrosswordCell[][];
  numbered: AutoNumberResult;
  isolatedSet: Set<string>;
  selected: { r: number; c: number };
  toolMode: 'char' | 'black';
  direction: 'across' | 'down';
  draftText: string;
  acrossClues: CrosswordClue[];
  downClues: CrosswordClue[];
  validation: { valid: boolean; message: string };
  submitError: string | null;
  isSubmitting: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onResize: (newRows: number, newCols: number) => void;
  onLoadTemplate: () => void;
  onSetToolMode: (mode: 'char' | 'black') => void;
  onToggleDirection: () => void;
  onSelectCell: (r: number, c: number) => void;
  onToggleBlack: (r: number, c: number) => void;
  onDraftTextChange: (next: string) => void;
  onCommitChars: (chars: string) => void;
  onBackspaceEmpty: () => void;
  onArrowKey: (dir: 'up' | 'down' | 'left' | 'right') => void;
  onUpdateAcrossClue: (number: number, text: string) => void;
  onUpdateDownClue: (number: number, text: string) => void;
  onPublish: (e: React.FormEvent) => void;
}

export function CrosswordCreator({
  rows,
  cols,
  rawGrid,
  numbered,
  isolatedSet,
  selected,
  toolMode,
  direction,
  draftText,
  acrossClues,
  downClues,
  validation,
  submitError,
  isSubmitting,
  inputRef,
  onResize,
  onLoadTemplate,
  onSetToolMode,
  onToggleDirection,
  onSelectCell,
  onToggleBlack,
  onDraftTextChange,
  onCommitChars,
  onBackspaceEmpty,
  onArrowKey,
  onUpdateAcrossClue,
  onUpdateDownClue,
  onPublish,
}: CrosswordCreatorProps) {
  const currentCellChar = rawGrid[selected.r]?.[selected.c]?.char ?? '';

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 左カラム：サイズ設定 & 盤面エディタ */}
        <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 lg:col-span-7">
          {/* タテ・ヨコ自由サイズ指定（3〜15） */}
          <div className="mb-5 w-full rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xs font-bold text-slate-800 sm:text-sm">
                盤面サイズ設定（3×3 〜 15×15）
              </h2>
              <button
                type="button"
                onClick={onLoadTemplate}
                className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>4×4サンプル配置を読み込む</span>
              </button>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>タテ（行数）: {rows}マス</span>
                  <select
                    value={rows}
                    onChange={(e) => onResize(Number(e.target.value), cols)}
                    className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs"
                  >
                    {Array.from({ length: 13 }, (_, i) => i + 3).map((n) => (
                      <option key={n} value={n}>
                        {n}行
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="range"
                  min={3}
                  max={15}
                  value={rows}
                  onChange={(e) => onResize(Number(e.target.value), cols)}
                  className="mt-1.5 w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>ヨコ（列数）: {cols}マス</span>
                  <select
                    value={cols}
                    onChange={(e) => onResize(rows, Number(e.target.value))}
                    className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs"
                  >
                    {Array.from({ length: 13 }, (_, i) => i + 3).map((n) => (
                      <option key={n} value={n}>
                        {n}列
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="range"
                  min={3}
                  max={15}
                  value={cols}
                  onChange={(e) => onResize(rows, Number(e.target.value))}
                  className="mt-1.5 w-full accent-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* 編集ツール切替：ひらがな入力 or 黒マス配置 & 進行方向 */}
          <div className="mb-4 flex w-full flex-wrap items-center justify-between gap-2">
            <div className="inline-flex rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => onSetToolMode('char')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                  toolMode === 'char'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Type className="h-3.5 w-3.5" />
                <span>白マス文字入力</span>
              </button>

              <button
                type="button"
                onClick={() => onSetToolMode('black')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                  toolMode === 'black'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Square className="h-3.5 w-3.5 fill-current" />
                <span>タップで黒マス切替</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onToggleDirection}
                className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                <span>
                  {direction === 'across'
                    ? '進行方向：ヨコ（右へ自動移動）'
                    : '進行方向：タテ（下へ自動移動）'}
                </span>
              </button>
            </div>

            <span className="w-full text-[11px] text-slate-500">
              ※白マスのダブルクリックで黒マス化／同じ白マスを再クリックでタテ・ヨコ進行方向を切替できます
            </span>
          </div>

          {/* クロスワード盤面グリッド */}
          <div
            className="grid w-full max-w-[460px] border-2 border-slate-800 bg-slate-800 select-none"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            }}
          >
            {numbered.grid.map((row, r) =>
              row.map((cell, c) => {
                const isSelected = selected.r === r && selected.c === c;
                const isIsolated = isolatedSet.has(`${r}-${c}`);

                if (cell.isBlack) {
                  return (
                    <button
                      key={`${r}-${c}`}
                      type="button"
                      onClick={() => {
                        onSelectCell(r, c);
                        onToggleBlack(r, c);
                      }}
                      className={`aspect-square border border-slate-700 bg-slate-900 transition ${
                        isSelected ? 'ring-2 ring-indigo-500 z-10' : ''
                      }`}
                      title="クリックで白マスに戻す"
                    />
                  );
                }

                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onClick={() => {
                      if (toolMode === 'black') {
                        onSelectCell(r, c);
                        onDraftTextChange('');
                        onToggleBlack(r, c);
                        return;
                      }
                      if (selected.r === r && selected.c === c) {
                        onToggleDirection();
                      } else {
                        onSelectCell(r, c);
                      }
                      onDraftTextChange('');
                      inputRef.current?.focus();
                    }}
                    onDoubleClick={() => {
                      if (toolMode !== 'black') {
                        onSelectCell(r, c);
                        onDraftTextChange('');
                        onToggleBlack(r, c);
                      }
                    }}
                    title={
                      isIsolated
                        ? '孤立した白マスです（2マス以上つなげるか黒マスにしてください）'
                        : 'クリックで文字入力 / ダブルクリックで黒マスにする'
                    }
                    className={`relative flex aspect-square items-center justify-center border border-slate-300 transition ${
                      isSelected
                        ? 'bg-indigo-100 ring-2 ring-indigo-600 z-10'
                        : isIsolated
                          ? 'bg-amber-50 ring-1 ring-amber-400'
                          : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    {cell.clueNumber !== undefined && (
                      <span className="absolute top-0.5 left-1 text-[9px] leading-none font-bold text-indigo-600 sm:text-[11px]">
                        {cell.clueNumber}
                      </span>
                    )}
                    <span className="mt-1 text-base font-bold text-slate-900 sm:text-xl">
                      {cell.char}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* 選択マスの編集バー */}
          <div className="mt-4 w-full max-w-[460px] space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <span className="text-xs font-bold text-slate-700">
                選択中：{selected.r + 1}行目・{selected.c + 1}列目（
                {direction === 'across' ? 'ヨコ連続入力' : 'タテ連続入力'}）
              </span>
              <button
                type="button"
                onClick={() => onToggleBlack(selected.r, selected.c)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <Square className="h-3 w-3 fill-slate-800" />
                <span>黒マスにする</span>
              </button>
            </div>

            <CrosswordInputBox
              inputRef={inputRef}
              draftText={draftText}
              onDraftTextChange={onDraftTextChange}
              onCommitChars={onCommitChars}
              onBackspaceEmpty={onBackspaceEmpty}
              onArrowKey={onArrowKey}
              placeholder={
                currentCellChar
                  ? `現在：「${currentCellChar}」（新しい文字を入力で上書き）`
                  : 'ひらがな・ローマ字（例: ka → か）を入力'
              }
              label=""
              clearButtonLabel="文字クリア"
              showKanaPalette={true}
            />
          </div>
        </div>

        {/* 右カラム：自動採番されたタテ・ヨコのカギ入力フォーム */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 lg:col-span-5">
          <div className="space-y-5">
            {/* バリデーション状態表示 */}
            <div
              className={`rounded-2xl border p-4 ${
                validation.valid
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-amber-200 bg-amber-50 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-bold">
                {validation.valid ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                )}
                <span>
                  {validation.valid
                    ? 'クロスワードチェック：OK（公開可能）'
                    : '入力状況チェック'}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed">
                {validation.message}
              </p>
            </div>

            {/* ヨコのカギ入力リスト */}
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                ヨコのカギ（自動採番：{numbered.acrossWords.length}件）
              </h3>
              {numbered.acrossWords.length === 0 ? (
                <p className="mt-2 text-xs text-slate-400">
                  ヨコに2マス以上続く白マスがあると自動で番号が表示されます
                </p>
              ) : (
                <div className="mt-2.5 max-h-60 space-y-2.5 overflow-y-auto pr-1">
                  {numbered.acrossWords.map((word) => {
                    const clueObj = acrossClues.find(
                      (c) => c.number === word.number
                    );
                    return (
                      <div
                        key={`across-input-${word.number}`}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-indigo-700">
                            ヨコ {word.number}番
                          </span>
                          <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-xs font-bold text-slate-700">
                            答え：{word.answer}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={clueObj?.text ?? ''}
                          onChange={(e) =>
                            onUpdateAcrossClue(word.number, e.target.value)
                          }
                          placeholder={`「${word.answer}」のヒント文を入力...`}
                          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* タテのカギ入力リスト */}
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                タテのカギ（自動採番：{numbered.downWords.length}件）
              </h3>
              {numbered.downWords.length === 0 ? (
                <p className="mt-2 text-xs text-slate-400">
                  タテに2マス以上続く白マスがあると自動で番号が表示されます
                </p>
              ) : (
                <div className="mt-2.5 max-h-60 space-y-2.5 overflow-y-auto pr-1">
                  {numbered.downWords.map((word) => {
                    const clueObj = downClues.find(
                      (c) => c.number === word.number
                    );
                    return (
                      <div
                        key={`down-input-${word.number}`}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-indigo-700">
                            タテ {word.number}番
                          </span>
                          <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-xs font-bold text-slate-700">
                            答え：{word.answer}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={clueObj?.text ?? ''}
                          onChange={(e) =>
                            onUpdateDownClue(word.number, e.target.value)
                          }
                          placeholder={`「${word.answer}」のヒント文を入力...`}
                          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* クロスワード公開ボタン */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            {submitError && (
              <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
                {submitError}
              </div>
            )}

            <button
              type="button"
              disabled={isSubmitting || !validation.valid}
              onClick={onPublish}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-sm transition ${
                validation.valid && !isSubmitting
                  ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99]'
                  : 'cursor-not-allowed bg-slate-300 text-slate-500'
              }`}
            >
              <Send className="h-4 w-4" />
              <span>
                {isSubmitting ? '公開処理中...' : 'このクロスワードを公開する'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
