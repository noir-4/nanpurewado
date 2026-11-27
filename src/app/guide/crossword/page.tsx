import React from 'react';
import Link from 'next/link';
import { Sparkles, CheckCircle2, HelpCircle, ArrowRight, Layers } from 'lucide-react';

export default function CrosswordGuidePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          <Sparkles className="h-3.5 w-3.5" />
          <span>クリエイター向けガイド</span>
        </div>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
          クロスワードの作り方ガイド・良問を作るコツ
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          当サイトでは、3×3のミニサイズから本格的な15×15サイズまで、ブラウザ上で誰でも簡単にクロスワードパズルを作成・公開できます。カギ番号の割り振りはすべて自動で行われます。
        </p>

        <hr className="my-6 border-slate-100" />

        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Layers className="h-5 w-5 text-indigo-600" />
            <span>当サイトの自動採番ルールと文字仕様</span>
          </h2>
          <div className="space-y-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
            <div className="rounded-xl bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900">
                1. カギ番号はリアルタイムで自動計算されます
              </h3>
              <p className="mt-1">
                2文字以上続く白マスの先頭（左端または左隣が黒マスなら「ヨコのカギ」、上端または上隣が黒マスなら「タテのカギ」）に対し、左上から順番に自動で 1, 2, 3... と番号が振られます。面倒な番号計算は一切不要です。
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <h3 className="font-bold text-slate-900">
                2. 小文字（っ・ゃ・ゅ・ょ等）は自動で通常文字に正規化されます
              </h3>
              <p className="mt-1">
                クロスワードの一般的なルールに従い、促音や拗音などの小文字（っ、ゃ、ゅ、ょ、ぁ、ぃ、ぅ、ぇ、ぉ、ゎ）は、すべて大文字（つ、や、ゆ、よ、あ、い、う、え、お、わ）として扱われます。たとえば「きっぷ（切符）」と「きつね（狐）」は3文字目の「つ」で交差させることができます。一方、濁音・半濁音（が、ぱ等）はそのまま別の文字として区別されます。
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>解きやすくて楽しいクロスワードを作る3つのステップ</span>
          </h2>
          <div className="space-y-4 text-xs leading-relaxed text-slate-600 sm:text-sm">
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="font-bold text-slate-900">
                ステップ1：まずは4×4〜6×6の小さいサイズから始める
              </h3>
              <p className="mt-1">
                初めて作るときは4×4や5×5のサイズがおすすめです。まずはメインにしたい長めの言葉（例：4〜5文字のテーマ語）を1〜2個配置し、そこから縦横に交差する短い言葉を当てはめていきましょう。
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="font-bold text-slate-900">
                ステップ2：「ん」で終わる言葉や黒マスの配置を活用する
              </h3>
              <p className="mt-1">
                日本語では「ん」から始まる単語がないため、「ん」が入るマスはタテまたはヨコの先頭にならないように黒マスを配置するのがコツです。うまく言葉が繋がらない場所には黒マスを置いて区切りましょう。
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="font-bold text-slate-900">
                ステップ3：ヒント文（カギ）は「誰が読んでも答えが1つに決まる」ように書く
              </h3>
              <p className="mt-1">
                「赤い食べ物」だけだと「りんご」「いちご」「とまと」など複数の候補が考えられます。「青森県が名産の赤い果物」のように、解く人が気持ちよく閃くヒント文を心がけるとクリア率がアップします。
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-xl bg-indigo-50 p-5">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-indigo-900">
                <HelpCircle className="h-4 w-4 text-indigo-600" />
                <span>あなただけのオリジナル問題を作ってみませんか？</span>
              </h3>
              <p className="mt-1 text-xs text-indigo-800">
                作成画面から「クロスワード作成」を選んで、今すぐパズルを公開できます。
              </p>
            </div>
            <Link
              href="/create"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
            >
              <span>パズル作成画面へ</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
