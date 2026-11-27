'use client';

import React from 'react';
import Link from 'next/link';
import { AdBanner } from '@/components/AdBanner';
import { Check, Copy, Share2, Sparkles, Trophy } from 'lucide-react';

export interface ClearModalProps {
  title: string;
  formattedTime: string;
  playCount: number;
  clearCount: number;
  copiedUrl: boolean;
  onCopyUrl: () => void;
  onShareOnX: () => void;
  onClose: () => void;
}

export function ClearModal({
  title,
  formattedTime,
  playCount,
  clearCount,
  copiedUrl,
  onCopyUrl,
  onShareOnX,
  onClose,
}: ClearModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md space-y-5 rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xl sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-500">
          <Trophy className="h-9 w-9" />
        </div>

        <div>
          <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>CONGRATULATIONS!</span>
          </div>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
            パズルクリア！！
          </h2>
          <p className="mt-1.5 text-xs text-slate-600">
            「{title}」を見事に解き明かしました！
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3.5 text-xs">
          <div>
            <div className="text-slate-500">クリアタイム</div>
            <div className="mt-0.5 font-mono text-base font-bold text-sky-700">
              {formattedTime}
            </div>
          </div>
          <div className="border-x border-slate-200/80">
            <div className="text-slate-500">累計プレイ</div>
            <div className="mt-0.5 text-base font-bold text-slate-900">
              {playCount}回
            </div>
          </div>
          <div>
            <div className="text-slate-500">累計クリア</div>
            <div className="mt-0.5 text-base font-bold text-emerald-600">
              {clearCount}回
            </div>
          </div>
        </div>

        {/* SNSシェア & URLコピーボタン */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onShareOnX}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Xでクリア報告</span>
          </button>
          <button
            type="button"
            onClick={onCopyUrl}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
          >
            {copiedUrl ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700">コピー完了！</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>問題URLをコピー</span>
              </>
            )}
          </button>
        </div>

        {/* クリアモーダル内広告枠 */}
        <AdBanner slot="modal" />

        <div className="flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
          >
            盤面を見る
          </button>
          <Link
            href="/"
            className="flex-1 rounded-xl bg-sky-600 py-2.5 text-xs font-bold text-white transition hover:bg-sky-700"
          >
            他のパズルを遊ぶ
          </Link>
        </div>
      </div>
    </div>
  );
}
