'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BasePuzzle,
  CrosswordBoardData,
  SudokuBoardData,
} from '@/types/puzzle';
import {
  puzzleRepository,
  REPORT_HIDE_THRESHOLD,
} from '@/repositories/puzzleRepository';
import {
  cloneSudokuBoard,
  findDuplicateCells,
  isSudokuCleared,
} from '@/utils/sudokuLogic';
import {
  assignCrosswordNumbers,
  isCrosswordCleared,
  normalizeHiraganaChar,
} from '@/utils/crosswordLogic';
import { AdBanner } from '@/components/AdBanner';
import { SudokuPlayPanel } from '@/components/sudoku/SudokuPlayPanel';
import { CrosswordPlayPanel } from '@/components/crossword/CrosswordPlayPanel';
import { ClearModal } from '@/components/play/ClearModal';
import {
  ArrowLeft,
  Flag,
  RotateCcw,
  User,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Copy,
  Check,
} from 'lucide-react';

interface SavedPlayProgress {
  type: 'sudoku' | 'crossword';
  sudokuBoard?: number[][];
  sudokuNotes?: number[][][];
  cwInputs?: string[][];
  elapsedSeconds: number;
  isCleared: boolean;
}

function formatElapsedTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function PlayPuzzlePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const puzzleId = params?.id ?? '';

  const [puzzle, setPuzzle] = useState<BasePuzzle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCleared, setIsCleared] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  const [reportMessage, setReportMessage] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // --- ナンプレ用 State ---
  const [sudokuBoard, setSudokuBoard] = useState<number[][]>([]);
  const [sudokuNotes, setSudokuNotes] = useState<number[][][]>([]);
  const [sudokuSelected, setSudokuSelected] = useState<{
    r: number;
    c: number;
  } | null>({ r: 0, c: 0 });
  const [isNoteMode, setIsNoteMode] = useState(false);

  // --- クロスワード用 State ---
  const [cwInputs, setCwInputs] = useState<string[][]>([]);
  const [cwSelected, setCwSelected] = useState<{
    r: number;
    c: number;
  } | null>(null);
  const [cwDirection, setCwDirection] = useState<'across' | 'down'>('across');
  const [cwDraftText, setCwDraftText] = useState('');
  const cwHiddenInputRef = useRef<HTMLInputElement | null>(null);

  // 初期ロード & playCount 加算（sessionStorage ガード付き）
  useEffect(() => {
    if (!puzzleId) return;
    let mounted = true;

    async function init() {
      setIsLoading(true);
      const data = await puzzleRepository.getPuzzleById(puzzleId);
      if (!mounted) return;

      if (!data) {
        setPuzzle(null);
        setIsLoading(false);
        return;
      }

      // sessionStorage で同一セッションのリロード連打防止
      const playedKey = `nanpurewado_played_${puzzleId}`;
      let updatedPlayCount = data.playCount;
      if (
        typeof window !== 'undefined' &&
        !window.sessionStorage.getItem(playedKey)
      ) {
        window.sessionStorage.setItem(playedKey, 'true');
        await puzzleRepository.incrementPlayCount(puzzleId);
        updatedPlayCount += 1;
      }

      const reportedKey = `nanpurewado_reported_${puzzleId}`;
      if (
        typeof window !== 'undefined' &&
        window.sessionStorage.getItem(reportedKey)
      ) {
        setHasReported(true);
      }

      const currentPuzzle: BasePuzzle = {
        ...data,
        playCount: updatedPlayCount,
      };
      setPuzzle(currentPuzzle);

      // 途中セーブデータの読み込みチェック
      const progressKey = `nanpurewado_progress_${puzzleId}`;
      let savedProgress: SavedPlayProgress | null = null;
      if (typeof window !== 'undefined') {
        try {
          const rawSaved = window.localStorage.getItem(progressKey);
          if (rawSaved) {
            savedProgress = JSON.parse(rawSaved) as SavedPlayProgress;
          }
        } catch {
          savedProgress = null;
        }
      }

      if (currentPuzzle.type === 'sudoku') {
        const bd = currentPuzzle.boardData as SudokuBoardData;
        if (
          savedProgress &&
          savedProgress.type === 'sudoku' &&
          Array.isArray(savedProgress.sudokuBoard) &&
          savedProgress.sudokuBoard.length === 9
        ) {
          setSudokuBoard(cloneSudokuBoard(savedProgress.sudokuBoard));
          setSudokuNotes(
            Array.isArray(savedProgress.sudokuNotes) &&
              savedProgress.sudokuNotes.length === 9
              ? savedProgress.sudokuNotes
              : Array.from({ length: 9 }, () =>
                  Array.from({ length: 9 }, () => [] as number[])
                )
          );
          setElapsedSeconds(Number(savedProgress.elapsedSeconds ?? 0));
          setIsCleared(Boolean(savedProgress.isCleared));
        } else {
          setSudokuBoard(cloneSudokuBoard(bd.initialBoard));
          setSudokuNotes(
            Array.from({ length: 9 }, () =>
              Array.from({ length: 9 }, () => [] as number[])
            )
          );
          setElapsedSeconds(0);
          setIsCleared(false);
        }

        let firstEmpty: { r: number; c: number } = { r: 0, c: 0 };
        outer: for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            if (bd.initialBoard[r][c] === 0) {
              firstEmpty = { r, c };
              break outer;
            }
          }
        }
        setSudokuSelected(firstEmpty);
      } else {
        const bd = currentPuzzle.boardData as CrosswordBoardData;
        if (
          savedProgress &&
          savedProgress.type === 'crossword' &&
          Array.isArray(savedProgress.cwInputs) &&
          savedProgress.cwInputs.length === bd.rows &&
          savedProgress.cwInputs[0]?.length === bd.cols
        ) {
          setCwInputs(savedProgress.cwInputs.map((row) => [...row]));
          setElapsedSeconds(Number(savedProgress.elapsedSeconds ?? 0));
          setIsCleared(Boolean(savedProgress.isCleared));
        } else {
          setCwInputs(
            Array.from({ length: bd.rows }, () => Array(bd.cols).fill(''))
          );
          setElapsedSeconds(0);
          setIsCleared(false);
        }

        let firstWhite: { r: number; c: number } | null = null;
        outerCw: for (let r = 0; r < bd.rows; r++) {
          for (let c = 0; c < bd.cols; c++) {
            if (!bd.grid[r][c].isBlack) {
              firstWhite = { r, c };
              break outerCw;
            }
          }
        }
        setCwSelected(firstWhite);
      }

      setIsLoading(false);
    }

    init();
    return () => {
      mounted = false;
    };
  }, [puzzleId]);

  // プレイタイム計測タイマー（1秒ごと・クリア後は停止）
  useEffect(() => {
    if (isLoading || !puzzle || isCleared) return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isLoading, puzzle, isCleared]);

  // プレイ状態の自動セーブ（localStorage）
  useEffect(() => {
    if (isLoading || !puzzle || !puzzleId || typeof window === 'undefined')
      return;
    const progressKey = `nanpurewado_progress_${puzzleId}`;
    const payload: SavedPlayProgress = {
      type: puzzle.type,
      sudokuBoard: puzzle.type === 'sudoku' ? sudokuBoard : undefined,
      sudokuNotes: puzzle.type === 'sudoku' ? sudokuNotes : undefined,
      cwInputs: puzzle.type === 'crossword' ? cwInputs : undefined,
      elapsedSeconds,
      isCleared,
    };
    try {
      window.localStorage.setItem(progressKey, JSON.stringify(payload));
    } catch {
      // ignore storage quota errors
    }
  }, [
    isLoading,
    puzzle,
    puzzleId,
    sudokuBoard,
    sudokuNotes,
    cwInputs,
    elapsedSeconds,
    isCleared,
  ]);

  // クリア時共通処理
  const triggerClear = useCallback(async () => {
    if (isCleared || !puzzle) return;
    setIsCleared(true);
    setShowClearModal(true);

    const clearedKey = `nanpurewado_cleared_${puzzle.id}`;
    if (
      typeof window !== 'undefined' &&
      !window.sessionStorage.getItem(clearedKey)
    ) {
      window.sessionStorage.setItem(clearedKey, 'true');
      await puzzleRepository.incrementClearCount(puzzle.id);
      setPuzzle((prev) =>
        prev ? { ...prev, clearCount: prev.clearCount + 1 } : prev
      );
    }
  }, [isCleared, puzzle]);

  // --- ナンプレの重複セル計算 ---
  const sudokuDuplicates = useMemo(() => {
    if (!puzzle || puzzle.type !== 'sudoku' || sudokuBoard.length !== 9) {
      return Array.from({ length: 9 }, () => Array(9).fill(false));
    }
    return findDuplicateCells(sudokuBoard);
  }, [puzzle, sudokuBoard]);

  // --- ナンプレ入力処理 ---
  const handleSudokuInput = useCallback(
    (num: number) => {
      if (!puzzle || puzzle.type !== 'sudoku' || !sudokuSelected) return;
      const bd = puzzle.boardData as SudokuBoardData;
      const { r, c } = sudokuSelected;

      // 初期配置マスは変更不可
      if (bd.initialBoard[r][c] !== 0) return;

      if (num === 0) {
        const nextBoard = cloneSudokuBoard(sudokuBoard);
        nextBoard[r][c] = 0;
        setSudokuBoard(nextBoard);
        setSudokuNotes((prev) => {
          const copy = prev.map((row) => row.map((cell) => [...cell]));
          copy[r][c] = [];
          return copy;
        });
        return;
      }

      if (isNoteMode) {
        if (sudokuBoard[r][c] !== 0) {
          const nextBoard = cloneSudokuBoard(sudokuBoard);
          nextBoard[r][c] = 0;
          setSudokuBoard(nextBoard);
        }
        setSudokuNotes((prev) => {
          const copy = prev.map((row) => row.map((cell) => [...cell]));
          const current = copy[r][c];
          if (current.includes(num)) {
            copy[r][c] = current.filter((n) => n !== num);
          } else {
            copy[r][c] = [...current, num].sort((a, b) => a - b);
          }
          return copy;
        });
      } else {
        const nextBoard = cloneSudokuBoard(sudokuBoard);
        const placedNum = nextBoard[r][c] === num ? 0 : num;
        nextBoard[r][c] = placedNum;
        setSudokuBoard(nextBoard);

        // 自マスのメモを消去し、さらに同じタテ列・ヨコ列・3x3ブロック内の同じ候補メモも自動消去する
        setSudokuNotes((prev) => {
          const copy = prev.map((row) => row.map((cell) => [...cell]));
          copy[r][c] = [];
          if (placedNum >= 1 && placedNum <= 9) {
            for (let i = 0; i < 9; i++) {
              copy[r][i] = copy[r][i].filter((n) => n !== placedNum);
              copy[i][c] = copy[i][c].filter((n) => n !== placedNum);
            }
            const startR = Math.floor(r / 3) * 3;
            const startC = Math.floor(c / 3) * 3;
            for (let dr = 0; dr < 3; dr++) {
              for (let dc = 0; dc < 3; dc++) {
                copy[startR + dr][startC + dc] = copy[startR + dr][
                  startC + dc
                ].filter((n) => n !== placedNum);
              }
            }
          }
          return copy;
        });

        if (isSudokuCleared(nextBoard)) {
          triggerClear();
        }
      }
    },
    [puzzle, sudokuSelected, sudokuBoard, isNoteMode, triggerClear]
  );

  // ナンプレのキーボード操作対応
  useEffect(() => {
    if (!puzzle || puzzle.type !== 'sudoku') return;

    function handleKeyDown(e: KeyboardEvent) {
      if (!sudokuSelected) return;
      const { r, c } = sudokuSelected;

      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        handleSudokuInput(Number(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        e.preventDefault();
        handleSudokuInput(0);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSudokuSelected({ r: (r + 8) % 9, c });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSudokuSelected({ r: (r + 1) % 9, c });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSudokuSelected({ r, c: (c + 8) % 9 });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSudokuSelected({ r, c: (c + 1) % 9 });
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setIsNoteMode((prev) => !prev);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [puzzle, sudokuSelected, handleSudokuInput]);

  // --- クロスワードの自動採番・ワード情報 ---
  const cwWordData = useMemo(() => {
    if (!puzzle || puzzle.type !== 'crossword') return null;
    const bd = puzzle.boardData as CrosswordBoardData;
    return assignCrosswordNumbers(bd.grid);
  }, [puzzle]);

  // 選択中のマスが含まれるヨコ・タテのワード情報
  const activeCwWords = useMemo(() => {
    if (!cwWordData || !cwSelected) {
      return { acrossWord: undefined, downWord: undefined };
    }
    const { r, c } = cwSelected;
    const acrossWord = cwWordData.acrossWords.find((w) =>
      w.cells.some((cell) => cell.r === r && cell.c === c)
    );
    const downWord = cwWordData.downWords.find((w) =>
      w.cells.some((cell) => cell.r === r && cell.c === c)
    );
    return { acrossWord, downWord };
  }, [cwWordData, cwSelected]);

  // クロスワードで1文字（または複数文字）入力確定し、次のマスへ順番に進める
  const handleCrosswordCharInput = useCallback(
    (rawText: string) => {
      if (!puzzle || puzzle.type !== 'crossword' || !cwSelected || !cwWordData)
        return;
      const bd = puzzle.boardData as CrosswordBoardData;

      const chars = Array.from(rawText)
        .map((ch) => normalizeHiraganaChar(ch))
        .filter(Boolean);
      if (chars.length === 0) return;

      const nextInputs = cwInputs.map((row) => [...row]);
      let currR = cwSelected.r;
      let currC = cwSelected.c;

      const currentWord =
        cwDirection === 'across'
          ? activeCwWords.acrossWord ?? activeCwWords.downWord
          : activeCwWords.downWord ?? activeCwWords.acrossWord;

      for (const normalized of chars) {
        if (bd.grid[currR]?.[currC]?.isBlack) break;
        nextInputs[currR][currC] = normalized;

        if (currentWord) {
          const idx = currentWord.cells.findIndex(
            (cell) => cell.r === currR && cell.c === currC
          );
          if (idx >= 0 && idx + 1 < currentWord.cells.length) {
            currR = currentWord.cells[idx + 1].r;
            currC = currentWord.cells[idx + 1].c;
          }
        }
      }

      setCwInputs(nextInputs);
      setCwSelected({ r: currR, c: currC });

      if (isCrosswordCleared(bd, nextInputs)) {
        triggerClear();
      }
    },
    [
      puzzle,
      cwSelected,
      cwWordData,
      cwInputs,
      cwDirection,
      activeCwWords,
      triggerClear,
    ]
  );

  const handleCrosswordClearCell = useCallback(() => {
    if (!puzzle || puzzle.type !== 'crossword' || !cwSelected) return;
    const { r, c } = cwSelected;
    const nextInputs = cwInputs.map((row) => [...row]);
    if (nextInputs[r][c] !== '') {
      nextInputs[r][c] = '';
      setCwInputs(nextInputs);
    } else {
      const currentWord =
        cwDirection === 'across'
          ? activeCwWords.acrossWord ?? activeCwWords.downWord
          : activeCwWords.downWord ?? activeCwWords.acrossWord;
      if (currentWord) {
        const idx = currentWord.cells.findIndex(
          (cell) => cell.r === r && cell.c === c
        );
        if (idx > 0) {
          const prevCell = currentWord.cells[idx - 1];
          nextInputs[prevCell.r][prevCell.c] = '';
          setCwInputs(nextInputs);
          setCwSelected(prevCell);
        }
      }
    }
  }, [puzzle, cwSelected, cwInputs, cwDirection, activeCwWords]);

  // クロスワード：入力欄以外にフォーカスがある状態でキーボードを押した際も入力欄へ誘導・矢印移動対応
  useEffect(() => {
    if (!puzzle || puzzle.type !== 'crossword') return;
    const bd = puzzle.boardData as CrosswordBoardData;

    function handleCwGlobalKeyDown(e: KeyboardEvent) {
      if (!cwSelected) return;
      const tag = (e.target as HTMLElement)?.tagName;
      const isInputFocused =
        e.target === cwHiddenInputRef.current ||
        tag === 'INPUT' ||
        tag === 'TEXTAREA';

      if (
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight'
      ) {
        e.preventDefault();
        const dr = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
        const dc = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
        let nr = cwSelected.r;
        let nc = cwSelected.c;
        for (let step = 0; step < Math.max(bd.rows, bd.cols); step++) {
          nr = (nr + dr + bd.rows) % bd.rows;
          nc = (nc + dc + bd.cols) % bd.cols;
          if (!bd.grid[nr][nc].isBlack) {
            setCwSelected({ r: nr, c: nc });
            setCwDraftText('');
            break;
          }
        }
        return;
      }

      if (!isInputFocused) {
        if (e.key === 'Backspace' || e.key === 'Delete') {
          e.preventDefault();
          handleCrosswordClearCell();
        } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          cwHiddenInputRef.current?.focus();
        }
      }
    }

    window.addEventListener('keydown', handleCwGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleCwGlobalKeyDown);
  }, [puzzle, cwSelected, handleCrosswordClearCell]);

  // 通報処理
  async function handleReportPuzzle() {
    if (!puzzle || hasReported) return;
    const confirmed = window.confirm(
      'このパズルに不適切な表現やルール違反が含まれていますか？運営へ問題を報告します。'
    );
    if (!confirmed) return;

    const newReportCount = await puzzleRepository.incrementReportCount(
      puzzle.id
    );
    const reportedKey = `nanpurewado_reported_${puzzle.id}`;
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(reportedKey, 'true');
    }
    setHasReported(true);

    if (newReportCount >= REPORT_HIDE_THRESHOLD) {
      setReportMessage(
        'ご報告ありがとうございます。通報数が基準値に達したため、このパズルは一覧から非表示となりました。'
      );
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } else {
      setReportMessage('問題を報告しました。ご協力ありがとうございます。');
    }
  }

  // リセット処理（途中セーブデータもクリア）
  function handleResetPuzzle() {
    if (!puzzle) return;
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(`nanpurewado_progress_${puzzle.id}`);
    }
    setElapsedSeconds(0);
    setIsCleared(false);
    if (puzzle.type === 'sudoku') {
      const bd = puzzle.boardData as SudokuBoardData;
      setSudokuBoard(cloneSudokuBoard(bd.initialBoard));
      setSudokuNotes(
        Array.from({ length: 9 }, () =>
          Array.from({ length: 9 }, () => [] as number[])
        )
      );
    } else {
      const bd = puzzle.boardData as CrosswordBoardData;
      setCwInputs(
        Array.from({ length: bd.rows }, () => Array(bd.cols).fill(''))
      );
    }
  }

  // URLコピー処理
  async function handleCopyShareUrl() {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      window.setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  // X(Twitter)シェア処理
  function handleShareOnX() {
    if (!puzzle || typeof window === 'undefined') return;
    const typeLabel =
      puzzle.type === 'sudoku' ? 'ナンプレ' : 'クロスワード';
    const text = isCleared
      ? `【${typeLabel}】「${puzzle.title}」（作：${puzzle.author}）をタイム ${formatElapsedTime(elapsedSeconds)} でクリアしました！ #ナンプレクロスワード広場`
      : `【${typeLabel}】「${puzzle.title}」（作：${puzzle.author}）に挑戦中！ #ナンプレクロスワード広場`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(window.location.href)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white p-6" />
        <div className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-white p-6" />
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-xs">
        <h1 className="text-lg font-bold text-slate-900">
          パズルが見つかりませんでした
        </h1>
        <p className="mt-2 text-xs text-slate-500">
          削除されたか、URLが正しくない可能性があります。
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-sky-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>トップページへ戻る</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* ナビゲーション & パズルアクションバー */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>パズル一覧に戻る</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyShareUrl}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            {copiedUrl ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700">URLコピー完了！</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>URLをコピー</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleResetPuzzle}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>最初からやり直す</span>
          </button>

          <button
            type="button"
            disabled={hasReported}
            onClick={handleReportPuzzle}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
              hasReported
                ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <Flag className="h-3.5 w-3.5" />
            <span>{hasReported ? '報告済み' : '問題を報告'}</span>
          </button>
        </div>
      </div>

      {reportMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs font-medium text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>{reportMessage}</span>
        </div>
      )}

      {/* パズル情報ヘッダー */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  puzzle.type === 'sudoku'
                    ? 'bg-sky-100 text-sky-700'
                    : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {puzzle.type === 'sudoku' ? 'ナンプレ（数独）' : 'クロスワード'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-xs font-bold text-slate-700">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                <span>{formatElapsedTime(elapsedSeconds)}</span>
              </span>
              {isCleared && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>クリア済み！</span>
                </span>
              )}
            </div>
            <h1 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
              {puzzle.title}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>製作者: {puzzle.author}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  公開日: {new Date(puzzle.createdAt).toLocaleDateString('ja-JP')}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl bg-slate-50 px-4 py-2.5 text-xs">
            <div>
              <span className="text-slate-500">プレイ回数: </span>
              <strong className="font-bold text-slate-800">
                {puzzle.playCount}回
              </strong>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div>
              <span className="text-slate-500">クリア回数: </span>
              <strong className="font-bold text-emerald-700">
                {puzzle.clearCount}回
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* ナンプレ プレイ画面 */}
      {puzzle.type === 'sudoku' && (
        <SudokuPlayPanel
          board={sudokuBoard}
          initialBoard={(puzzle.boardData as SudokuBoardData).initialBoard}
          notes={sudokuNotes}
          duplicates={sudokuDuplicates}
          selected={sudokuSelected}
          isNoteMode={isNoteMode}
          onSelectCell={(r, c) => setSudokuSelected({ r, c })}
          onToggleNoteMode={setIsNoteMode}
          onInputNumber={handleSudokuInput}
        />
      )}

      {/* クロスワード プレイ画面 */}
      {puzzle.type === 'crossword' && cwWordData && (
        <CrosswordPlayPanel
          boardData={puzzle.boardData as CrosswordBoardData}
          wordData={cwWordData}
          inputs={cwInputs}
          selected={cwSelected}
          direction={cwDirection}
          draftText={cwDraftText}
          activeWords={activeCwWords}
          inputRef={cwHiddenInputRef}
          onSelectCell={(r, c) => {
            setCwSelected({ r, c });
            setCwDraftText('');
          }}
          onToggleDirection={() =>
            setCwDirection((d) => (d === 'across' ? 'down' : 'across'))
          }
          onSelectDirection={setCwDirection}
          onDraftTextChange={setCwDraftText}
          onCommitChars={handleCrosswordCharInput}
          onClearCell={handleCrosswordClearCell}
        />
      )}

      {/* プレイ画面下部広告枠 */}
      <AdBanner slot="play-bottom" />

      {/* クリア演出モーダル */}
      {showClearModal && (
        <ClearModal
          title={puzzle.title}
          formattedTime={formatElapsedTime(elapsedSeconds)}
          playCount={puzzle.playCount}
          clearCount={puzzle.clearCount}
          copiedUrl={copiedUrl}
          onCopyUrl={handleCopyShareUrl}
          onShareOnX={handleShareOnX}
          onClose={() => setShowClearModal(false)}
        />
      )}
    </div>
  );
}
