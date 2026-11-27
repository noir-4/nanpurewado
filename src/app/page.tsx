'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BasePuzzle,
  CrosswordBoardData,
  PuzzleType,
  SudokuBoardData,
} from '@/types/puzzle';
import { puzzleRepository } from '@/repositories/puzzleRepository';
import { AdBanner } from '@/components/AdBanner';
import {
  Search,
  Grid3X3,
  Hash,
  Play,
  Trophy,
  Calendar,
  User,
  ArrowUpDown,
  PlusCircle,
} from 'lucide-react';

type SortOrder = 'newest' | 'popular';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<PuzzleType>('sudoku');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [puzzles, setPuzzles] = useState<BasePuzzle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const data = await puzzleRepository.getPuzzles();
        if (mounted) {
          setPuzzles(data);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredAndSortedPuzzles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = puzzles.filter((puzzle) => {
      if (puzzle.type !== activeTab) return false;
      if (!q) return true;
      return (
        puzzle.title.toLowerCase().includes(q) ||
        puzzle.author.toLowerCase().includes(q)
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortOrder === 'popular') {
        if (b.playCount !== a.playCount) {
          return b.playCount - a.playCount;
        }
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [puzzles, activeTab, searchQuery, sortOrder]);

  const sudokuCount = useMemo(
    () => puzzles.filter((p) => p.type === 'sudoku').length,
    [puzzles]
  );
  const crosswordCount = useMemo(
    () => puzzles.filter((p) => p.type === 'crossword').length,
    [puzzles]
  );

  function formatDate(iso: string): string {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return iso;
    }
  }

  function getClearRate(playCount: number, clearCount: number): string {
    if (playCount <= 0) return '0%';
    const rate = Math.min(100, Math.round((clearCount / playCount) * 100));
    return `${rate}%`;
  }

  function getPuzzleBadgeInfo(puzzle: BasePuzzle): string {
    if (puzzle.type === 'sudoku') {
      const bd = puzzle.boardData as SudokuBoardData;
      let clues = 0;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (bd.initialBoard?.[r]?.[c] > 0) clues++;
        }
      }
      return `9×9 / 初期ヒント ${clues}マス`;
    } else {
      const bd = puzzle.boardData as CrosswordBoardData;
      const totalClues =
        (bd.clues?.across?.length ?? 0) + (bd.clues?.down?.length ?? 0);
      return `${bd.rows}×${bd.cols} / カギ数 ${totalClues}問`;
    }
  }

  return (
    <div className="space-y-6">
      {/* ヒーローセクション */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-sky-600 to-indigo-700 p-6 text-white shadow-sm sm:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-xl space-y-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              みんなのナンプレ＆クロスワード
            </h1>
            <p className="text-xs leading-relaxed text-sky-100 sm:text-sm">
              全国のパズルファンが投稿した「唯一解保証つきナンプレ」と「本格クロスワード」をブラウザですぐに遊べます。あなたのオリジナル問題も簡単に作成・公開できます。
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-sky-700 shadow-sm transition hover:bg-sky-50"
            >
              <PlusCircle className="h-4 w-4" />
              <span>新しいパズルを作る</span>
            </Link>
          </div>
        </div>
      </section>

      {/* タブ切り替え & 検索・ソートバー */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* 2タブ構成 */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1.5 sm:w-auto sm:inline-grid">
            <button
              type="button"
              onClick={() => setActiveTab('sudoku')}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition ${
                activeTab === 'sudoku'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
              <span>ナンプレ</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  activeTab === 'sudoku'
                    ? 'bg-sky-100 text-sky-700'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {sudokuCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('crossword')}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition ${
                activeTab === 'crossword'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Hash className="h-4 w-4" />
              <span>クロスワード</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  activeTab === 'crossword'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {crosswordCount}
              </span>
            </button>
          </div>

          {/* 検索 & ソート */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:w-64">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="タイトル・製作者名で検索..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-slate-400" />
              <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setSortOrder('newest')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    sortOrder === 'newest'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  新着順
                </button>
                <button
                  type="button"
                  onClick={() => setSortOrder('popular')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    sortOrder === 'popular'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  プレイ数順
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* パズルカード一覧 */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
            />
          ))}
        </div>
      ) : filteredAndSortedPuzzles.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <p className="text-base font-bold text-slate-700">
            該当するパズルが見つかりませんでした
          </p>
          <p className="mt-1 text-xs text-slate-500">
            検索条件を変更するか、新しいパズルを作成して公開してみましょう！
          </p>
          <Link
            href="/create"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-sky-700"
          >
            <PlusCircle className="h-4 w-4" />
            <span>パズルを作成する</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedPuzzles.map((puzzle, index) => (
            <React.Fragment key={puzzle.id}>
              <article className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        puzzle.type === 'sudoku'
                          ? 'bg-sky-50 text-sky-700'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {puzzle.type === 'sudoku' ? (
                        <Grid3X3 className="h-3 w-3" />
                      ) : (
                        <Hash className="h-3 w-3" />
                      )}
                      <span>
                        {puzzle.type === 'sudoku' ? 'ナンプレ' : 'クロスワード'}
                      </span>
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      {getPuzzleBadgeInfo(puzzle)}
                    </span>
                  </div>

                  <h2 className="mt-3 line-clamp-2 text-base font-bold text-slate-900 group-hover:text-sky-700">
                    {puzzle.title}
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span>{puzzle.author}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{formatDate(puzzle.createdAt)}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="mb-3 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2.5 text-center">
                    <div>
                      <div className="text-[10px] text-slate-500">プレイ数</div>
                      <div className="mt-0.5 text-xs font-bold text-slate-800">
                        {puzzle.playCount}回
                      </div>
                    </div>
                    <div className="border-x border-slate-200/70">
                      <div className="text-[10px] text-slate-500">クリア数</div>
                      <div className="mt-0.5 text-xs font-bold text-emerald-700">
                        {puzzle.clearCount}回
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">クリア率</div>
                      <div className="mt-0.5 inline-flex items-center gap-0.5 text-xs font-bold text-amber-600">
                        <Trophy className="h-3 w-3" />
                        <span>
                          {getClearRate(puzzle.playCount, puzzle.clearCount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/play/${puzzle.id}`}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-xs transition sm:text-sm ${
                      puzzle.type === 'sudoku'
                        ? 'bg-sky-600 hover:bg-sky-700'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    <Play className="h-4 w-4 fill-current" />
                    <span>この問題をプレイする</span>
                  </Link>
                </div>
              </article>

              {/* インフィード広告プレースホルダー（2件目の直後、または一覧末尾に1枠以上表示） */}
              {(index === 1 ||
                (filteredAndSortedPuzzles.length === 1 && index === 0)) && (
                <div className="flex items-stretch">
                  <AdBanner
                    slot="infeed"
                    className="flex w-full flex-col justify-center"
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
