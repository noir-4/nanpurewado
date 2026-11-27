'use client';

import React, { useRef } from 'react';
import { extractHiraganaAndPendingRomaji } from '@/utils/crosswordLogic';
import { Eraser } from 'lucide-react';

export interface CrosswordInputBoxProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  draftText: string;
  onDraftTextChange: (next: string) => void;
  onCommitChars: (chars: string) => void;
  onBackspaceEmpty: () => void;
  onArrowKey?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  placeholder?: string;
  label?: string;
  clearButtonLabel?: string;
  showKanaPalette?: boolean;
}

/**
 * クロスワード用のひらがな・ローマ字入力フォーム＆五十音パレット共通コンポーネント
 * - 日本語IME変換中の文字列を消去せず保持（ka → か 等の変換を妨げない）
 * - IMEオフ（半角英数）時の直接ローマ字変換（ka → か、nn → ん 等）にも対応
 */
export function CrosswordInputBox({
  inputRef,
  draftText,
  onDraftTextChange,
  onCommitChars,
  onBackspaceEmpty,
  onArrowKey,
  placeholder = 'ここをタップして入力（例: ka → か）...',
  label = '選択マスへ文字を入力（ローマ字「ka→か」や日本語IMEに対応・小文字「っ/ゃ/ゅ/ょ」は自動で「つ/や/ゆ/よ」に変換）',
  clearButtonLabel = '1字消す',
  showKanaPalette = true,
}: CrosswordInputBoxProps) {
  const isComposingRef = useRef(false);

  return (
    <div className="w-full space-y-3">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        {label && (
          <label className="mb-2 block text-xs font-bold text-slate-700">
            {label}
          </label>
        )}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={draftText}
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onCompositionEnd={(e) => {
              isComposingRef.current = false;
              const val = e.currentTarget.value;
              const { converted, pending } =
                extractHiraganaAndPendingRomaji(val);
              if (converted) {
                onCommitChars(converted);
              }
              onDraftTextChange(pending);
            }}
            onChange={(e) => {
              const val = e.target.value;
              if (isComposingRef.current) {
                onDraftTextChange(val);
                return;
              }
              const { converted, pending } =
                extractHiraganaAndPendingRomaji(val);
              if (converted) {
                onCommitChars(converted);
              }
              onDraftTextChange(pending);
            }}
            onKeyDown={(e) => {
              if (isComposingRef.current) return;
              if (
                (e.key === 'Backspace' || e.key === 'Delete') &&
                draftText === ''
              ) {
                e.preventDefault();
                onBackspaceEmpty();
              } else if (e.key === 'Enter' && draftText === 'n') {
                e.preventDefault();
                onCommitChars('ん');
                onDraftTextChange('');
              } else if (onArrowKey) {
                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  onArrowKey('up');
                } else if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  onArrowKey('down');
                } else if (e.key === 'ArrowLeft') {
                  e.preventDefault();
                  onArrowKey('left');
                } else if (e.key === 'ArrowRight') {
                  e.preventDefault();
                  onArrowKey('right');
                }
              }
            }}
            placeholder={placeholder}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              onDraftTextChange('');
              onBackspaceEmpty();
            }}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
          >
            <Eraser className="h-4 w-4 text-slate-500" />
            <span>{clearButtonLabel}</span>
          </button>
        </div>
      </div>

      {showKanaPalette && (
        <details className="rounded-xl border border-slate-200 bg-white p-3">
          <summary className="cursor-pointer text-xs font-bold text-slate-700">
            画面上の五十音パッドで入力する（クリックで開閉）
          </summary>
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-10 gap-1">
              {Array.from(
                'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんー'
              ).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => onCommitChars(ch)}
                  className="rounded-md border border-slate-200 bg-slate-50 py-1.5 text-xs font-bold text-slate-800 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  {ch}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-10 gap-1 pt-1">
              {Array.from(
                'がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ'
              ).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => onCommitChars(ch)}
                  className="rounded-md border border-slate-200 bg-amber-50/50 py-1.5 text-xs font-bold text-slate-800 hover:bg-amber-100"
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>
        </details>
      )}
    </div>
  );
}
