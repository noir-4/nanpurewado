import React from 'react';
import { Megaphone } from 'lucide-react';

export interface AdBannerProps {
  slot?: 'infeed' | 'play-bottom' | 'modal' | string;
  className?: string;
}

export function AdBanner({ slot = 'infeed', className = '' }: AdBannerProps) {
  const labelMap: Record<string, string> = {
    infeed: 'スポンサーリンク（インフィード広告枠）',
    'play-bottom': 'スポンサーリンク（プレイ画面下部広告枠）',
    modal: 'スポンサーリンク（クリア画面広告枠）',
  };

  const label = labelMap[slot] ?? `スポンサーリンク（${slot}）`;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-dashed border-slate-300 bg-gradient-to-br from-slate-100 to-slate-50 p-4 text-center shadow-xs ${className}`}
      data-ad-slot={slot}
      aria-label="広告枠プレースホルダー"
    >
      <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[10px] font-medium tracking-wider text-slate-600 uppercase">
        <Megaphone className="h-3 w-3" />
        <span>AD / {slot.toUpperCase()}</span>
      </div>
      <p className="text-xs font-medium text-slate-600">{label}</p>
      <p className="mt-1 text-[11px] text-slate-400">
        脳トレパズルを毎日楽しもう！オリジナル問題の投稿も歓迎中
      </p>
    </div>
  );
}
