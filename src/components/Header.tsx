'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Grid3X3, PlusCircle, BookOpen, Home } from 'lucide-react';

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-slate-900 transition hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs transition group-hover:bg-sky-700">
            <Grid3X3 className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-base font-bold tracking-tight sm:text-lg">
              ナンプレ＆クロスワード広場
            </span>
            <span className="block text-[11px] text-slate-500">
              作って遊べるパズル共有サイト
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition sm:text-sm ${
              pathname === '/'
                ? 'bg-slate-100 text-sky-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">パズル一覧</span>
          </Link>

          <Link
            href="/guide/sudoku"
            className={`hidden md:inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition sm:text-sm ${
              pathname?.startsWith('/guide')
                ? 'bg-slate-100 text-sky-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>遊び方・作り方</span>
          </Link>

          <Link
            href="/create"
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-sky-700 active:scale-[0.99] sm:px-4 sm:text-sm"
          >
            <PlusCircle className="h-4 w-4" />
            <span>パズルを作る</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
