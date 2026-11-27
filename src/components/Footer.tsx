import React from 'react';
import Link from 'next/link';
import { BookOpen, FileText, ShieldCheck, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              ナンプレ＆クロスワード広場
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              誰でもオリジナルのナンプレ（数独）やクロスワードパズルを作成・公開し、全国のユーザーと楽しめるパズル共有プラットフォームです。
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
              ガイド・解説記事
            </h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link
                  href="/guide/sudoku"
                  className="inline-flex items-center gap-1.5 text-slate-600 transition hover:text-sky-600"
                >
                  <BookOpen className="h-3.5 w-3.5 text-sky-600" />
                  <span>ナンプレの遊び方・解き方のコツ</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/guide/crossword"
                  className="inline-flex items-center gap-1.5 text-slate-600 transition hover:text-sky-600"
                >
                  <Sparkles className="h-3.5 w-3.5 text-sky-600" />
                  <span>クロスワードの作り方ガイド</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
              サイト情報・規約
            </h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link
                  href="/terms"
                  className="inline-flex items-center gap-1.5 text-slate-600 transition hover:text-sky-600"
                >
                  <FileText className="h-3.5 w-3.5 text-slate-500" />
                  <span>利用規約・プライバシーポリシー</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/create"
                  className="inline-flex items-center gap-1.5 text-slate-600 transition hover:text-sky-600"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>唯一解チェック付きパズル作成ツール</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} ナンプレ＆クロスワード広場 All rights reserved.
        </div>
      </div>
    </footer>
  );
}
