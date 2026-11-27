import React from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, Lightbulb, Sparkles, ArrowRight } from 'lucide-react';

export default function SudokuGuidePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
          <BookOpen className="h-3.5 w-3.5" />
          <span>パズル解説ガイド</span>
        </div>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
          ナンプレ（数独）の遊び方・解き方のコツ
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          ナンプレ（ナンバープレース／数独）は、9×9のマス目に1から9までの数字をルールに従って埋めていく世界中で人気の論理パズルです。計算は必要なく、注意力と推理力だけで誰でも楽しく遊べます。
        </p>

        <hr className="my-6 border-slate-100" />

        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <CheckCircle2 className="h-5 w-5 text-sky-600" />
            <span>基本ルールはたったの3つ</span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs font-bold text-sky-600">ルール 1</div>
              <h3 className="mt-1 text-sm font-bold text-slate-900">ヨコの列に1〜9</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                横一列（9マス）の中に、1〜9の数字が重複しないように1つずつ入ります。
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs font-bold text-sky-600">ルール 2</div>
              <h3 className="mt-1 text-sm font-bold text-slate-900">タテの列に1〜9</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                縦一列（9マス）の中にも、1〜9の数字が重複しないように1つずつ入ります。
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs font-bold text-sky-600">ルール 3</div>
              <h3 className="mt-1 text-sm font-bold text-slate-900">3×3ブロックに1〜9</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                太線で囲まれた3×3のブロック（9マス）の中にも、1〜9が1つずつ入ります。
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <span>初心者から中級者へのステップアップ・解き方のコツ</span>
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-slate-700">
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="font-bold text-slate-900">
                1. たくさん出ている数字から注目する（クロスチェック法）
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                当サイトでは、数字が入っているマスをタップすると盤面上の「同じ数字」がすべてハイライト表示されます。すでに多く配置されている数字を選び、まだその数字が入っていない3×3ブロックに対してタテ・ヨコのラインを照らし合わせると、入れる場所が1つに絞れるマスがすぐに見つかります。
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="font-bold text-slate-900">
                2. 残り1・2マスの列やブロックを探す（フルハウス・ラストワン）
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                タテ列・ヨコ列・3×3ブロックの中で、すでに7〜8個の数字が埋まっている場所を探しましょう。まだ使われていない数字を数えるだけで、簡単に空白マスを確定できます。
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="font-bold text-slate-900">
                3. 「候補数字メモ」機能を活用する
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                中級以上の問題では、1つのマスに入りうる候補を小さくメモしておくのが定石です。プレイ画面の「メモ入力」モードをONにすると、各マスに1〜9の小さな候補数字を仮置きできます。あるマスに入る候補が1つだけになったり、ブロック内で特定の候補が1箇所にしか入らないことが視覚的にわかります。
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-xl bg-sky-50 p-5">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-sky-900">
                <Sparkles className="h-4 w-4 text-sky-600" />
                <span>実際にパズルを遊んでみよう！</span>
              </h3>
              <p className="mt-1 text-xs text-sky-800">
                理解したらさっそく公開されているナンプレに挑戦したり、自分で唯一解パズルを作ってみましょう。
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-sky-700"
              >
                <span>問題を解く</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/guide/crossword"
                className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-white px-4 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
              >
                <span>クロスワードガイドへ</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
