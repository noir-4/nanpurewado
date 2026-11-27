'use client';

import React from 'react';
import { CrosswordBoardData } from '@/types/puzzle';
import { AutoNumberResult, CrosswordWordInfo } from '@/utils/crosswordLogic';
import { CrosswordInputBox } from '@/components/crossword/CrosswordInputBox';
import { ArrowRightLeft } from 'lucide-react';

export interface CrosswordPlayPanelProps {
  boardData: CrosswordBoardData;
  wordData: AutoNumberResult;
  inputs: string[][];
  selected: { r: number; c: number } | null;
  direction: 'across' | 'down';
  draftText: string;
  activeWords: {
    acrossWord?: CrosswordWordInfo;
    downWord?: CrosswordWordInfo;
  };
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSelectCell: (r: number, c: number) => void;
  onToggleDirection: () => void;
  onSelectDirection: (dir: 'across' | 'down') => void;
  onDraftTextChange: (next: string) => void;
  onCommitChars: (chars: string) => void;
  onClearCell: () => void;
}

export function CrosswordPlayPanel({
  boardData,
  wordData,
  inputs,
  selected,
  direction,
  draftText,
  activeWords,
  inputRef,
  onSelectCell,
  onToggleDirection,
  onSelectDirection,
  onDraftTextChange,
  onCommitChars,
  onClearCell,
}: CrosswordPlayPanelProps) {
  const activeWord =
    direction === 'across'
      ? activeWords.acrossWord ?? activeWords.downWord
      : activeWords.downWord ?? activeWords.acrossWord;

  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* 左カラム：クロスワード盤面 & 文字入力バー */}
      <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-6 lg:col-span-7">
        {/* 現在選択中のカギ案内バナー */}
        <div className="mb-4 w-full rounded-xl border border-indigo-100 bg-indigo-50/70 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2 py-0.5 text-[11px] font-bold text-white">
              {direction === 'across' ? 'ヨコのカギ優先' : 'タテのカギ優先'}
            </span>
            <button
              type="button"
              onClick={onToggleDirection}
              className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-indigo-700 transition hover:bg-indigo-100"
            >
              <ArrowRightLeft className="h-3 w-3" />
              <span>タテ・ヨコ方向切替</span>
            </button>
          </div>

          <div className="mt-2 space-y-1 text-xs text-slate-700">
            {activeWords.acrossWord && (
              <div
                className={`rounded-lg px-2 py-1 ${
                  direction === 'across'
                    ? 'bg-indigo-100/80 font-bold text-indigo-950'
                    : 'text-slate-600'
                }`}
              >
                <span className="font-bold text-indigo-700">
                  [ヨコ {activeWords.acrossWord.number}]
                </span>{' '}
                {boardData.clues.across.find(
                  (c) => c.number === activeWords.acrossWord?.number
                )?.text ?? ''}
              </div>
            )}
            {activeWords.downWord && (
              <div
                className={`rounded-lg px-2 py-1 ${
                  direction === 'down'
                    ? 'bg-indigo-100/80 font-bold text-indigo-950'
                    : 'text-slate-600'
                }`}
              >
                <span className="font-bold text-indigo-700">
                  [タテ {activeWords.downWord.number}]
                </span>{' '}
                {boardData.clues.down.find(
                  (c) => c.number === activeWords.downWord?.number
                )?.text ?? ''}
              </div>
            )}
            {!activeWords.acrossWord && !activeWords.downWord && (
              <p className="text-slate-500">
                盤面の白マスをタップして文字を入力してください
              </p>
            )}
          </div>
        </div>

        {/* 盤面グリッド */}
        <div
          className="grid w-full max-w-[440px] border-2 border-slate-800 bg-slate-800 select-none"
          style={{
            gridTemplateColumns: `repeat(${boardData.cols}, minmax(0, 1fr))`,
          }}
        >
          {wordData.grid.map((row, r) =>
            row.map((cell, c) => {
              if (cell.isBlack) {
                return (
                  <div
                    key={`${r}-${c}`}
                    className="aspect-square border border-slate-700 bg-slate-900"
                  />
                );
              }

              const isSelected = selected?.r === r && selected?.c === c;
              const isInActiveWord =
                activeWord?.cells.some((pos) => pos.r === r && pos.c === c) ??
                false;
              const userChar = inputs[r]?.[c] ?? '';

              let bgClass = 'bg-white hover:bg-slate-50';
              if (isInActiveWord) {
                bgClass = 'bg-indigo-50';
              }
              if (isSelected) {
                bgClass = 'bg-indigo-200 ring-2 ring-indigo-600 z-10';
              }

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => {
                    if (selected?.r === r && selected?.c === c) {
                      onToggleDirection();
                    } else {
                      onSelectCell(r, c);
                    }
                    inputRef.current?.focus();
                  }}
                  className={`relative flex aspect-square items-center justify-center border border-slate-300 transition ${bgClass}`}
                >
                  {cell.clueNumber !== undefined && (
                    <span className="absolute top-0.5 left-1 text-[9px] leading-none font-bold text-slate-500 sm:text-[11px]">
                      {cell.clueNumber}
                    </span>
                  )}
                  <span className="mt-1 text-base font-bold text-slate-900 sm:text-xl">
                    {userChar}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* ひらがな・ローマ字入力フォーム & 五十音パッド */}
        <div className="mt-5 w-full max-w-[440px]">
          <CrosswordInputBox
            inputRef={inputRef}
            draftText={draftText}
            onDraftTextChange={onDraftTextChange}
            onCommitChars={onCommitChars}
            onBackspaceEmpty={onClearCell}
          />
        </div>
      </div>

      {/* 右カラム：ヨコのカギ・タテのカギ一覧（連動ハイライト付き） */}
      <div className="flex flex-col gap-4 lg:col-span-5">
        {/* ヨコのカギ */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900">ヨコのカギ</h2>
          <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
            {boardData.clues.across.map((clue) => {
              const isHighlighted =
                activeWords.acrossWord?.number === clue.number;
              const wordInfo = wordData.acrossWords.find(
                (w) => w.number === clue.number
              );

              return (
                <li key={`across-${clue.number}`}>
                  <button
                    type="button"
                    onClick={() => {
                      if (wordInfo) {
                        onSelectCell(wordInfo.startRow, wordInfo.startCol);
                        onSelectDirection('across');
                        inputRef.current?.focus();
                      }
                    }}
                    className={`flex w-full items-start gap-2.5 rounded-xl border p-3 text-left text-xs transition ${
                      isHighlighted
                        ? 'border-indigo-400 bg-indigo-50 font-semibold text-indigo-950 shadow-2xs'
                        : 'border-slate-100 bg-slate-50/70 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${
                        isHighlighted
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {clue.number}
                    </span>
                    <span className="leading-relaxed">{clue.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* タテのカギ */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900">タテのカギ</h2>
          <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
            {boardData.clues.down.map((clue) => {
              const isHighlighted =
                activeWords.downWord?.number === clue.number;
              const wordInfo = wordData.downWords.find(
                (w) => w.number === clue.number
              );

              return (
                <li key={`down-${clue.number}`}>
                  <button
                    type="button"
                    onClick={() => {
                      if (wordInfo) {
                        onSelectCell(wordInfo.startRow, wordInfo.startCol);
                        onSelectDirection('down');
                        inputRef.current?.focus();
                      }
                    }}
                    className={`flex w-full items-start gap-2.5 rounded-xl border p-3 text-left text-xs transition ${
                      isHighlighted
                        ? 'border-indigo-400 bg-indigo-50 font-semibold text-indigo-950 shadow-2xs'
                        : 'border-slate-100 bg-slate-50/70 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${
                        isHighlighted
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {clue.number}
                    </span>
                    <span className="leading-relaxed">{clue.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
