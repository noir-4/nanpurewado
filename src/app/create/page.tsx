'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CrosswordBoardData,
  CrosswordCell,
  CrosswordClue,
  PuzzleType,
  SudokuBoardData,
} from '@/types/puzzle';
import { puzzleRepository } from '@/repositories/puzzleRepository';
import {
  carveUniqueHoles,
  cloneSudokuBoard,
  createEmptySudokuBoard,
  findDuplicateCells,
  generateCompleteSudokuBoard,
  validateUniqueSudoku,
} from '@/utils/sudokuLogic';
import {
  assignCrosswordNumbers,
  createEmptyCrosswordGrid,
  findIsolatedWhiteCells,
  normalizeHiraganaChar,
  syncCluesWithWords,
  validateCrosswordCreation,
} from '@/utils/crosswordLogic';
import { checkNgWords } from '@/utils/ngWords';
import {
  SudokuCreateMode,
  SudokuCreator,
} from '@/components/sudoku/SudokuCreator';
import { CrosswordCreator } from '@/components/crossword/CrosswordCreator';
import { ArrowLeft, Grid3X3, Hash } from 'lucide-react';

export default function CreatePuzzlePage() {
  const router = useRouter();

  // 共通フォーム State
  const [puzzleType, setPuzzleType] = useState<PuzzleType>('sudoku');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==================== ナンプレ作成用 State ====================
  const [sudokuMode, setSudokuMode] = useState<SudokuCreateMode>('carve');
  const [carveBaseSolution, setCarveBaseSolution] = useState<number[][]>(() =>
    createEmptySudokuBoard()
  );
  const [sudokuBoard, setSudokuBoard] = useState<number[][]>(() =>
    createEmptySudokuBoard()
  );
  const [sudokuSelected, setSudokuSelected] = useState<{
    r: number;
    c: number;
  }>({ r: 0, c: 0 });

  useEffect(() => {
    const complete = generateCompleteSudokuBoard();
    setCarveBaseSolution(complete);
    setSudokuBoard(carveUniqueHoles(complete, 36));
  }, []);

  function handleSwitchSudokuMode(mode: SudokuCreateMode) {
    setSudokuMode(mode);
    setSubmitError(null);
    if (mode === 'carve') {
      const complete = generateCompleteSudokuBoard();
      setCarveBaseSolution(complete);
      setSudokuBoard(carveUniqueHoles(complete, 36));
    } else {
      setSudokuBoard(createEmptySudokuBoard());
    }
  }

  function handleRegenerateCarveBase(withAutoHoles: boolean) {
    const complete = generateCompleteSudokuBoard();
    setCarveBaseSolution(complete);
    if (withAutoHoles) {
      setSudokuBoard(carveUniqueHoles(complete, 40));
    } else {
      setSudokuBoard(cloneSudokuBoard(complete));
    }
  }

  const sudokuDuplicates = useMemo(
    () => findDuplicateCells(sudokuBoard),
    [sudokuBoard]
  );

  const sudokuValidation = useMemo(
    () => validateUniqueSudoku(sudokuBoard),
    [sudokuBoard]
  );

  const handleCarveCellClick = useCallback(
    (r: number, c: number) => {
      setSudokuSelected({ r, c });
      setSudokuBoard((prev) => {
        const next = cloneSudokuBoard(prev);
        if (next[r][c] === 0) {
          next[r][c] = carveBaseSolution[r]?.[c] ?? 0;
        } else {
          next[r][c] = 0;
        }
        return next;
      });
    },
    [carveBaseSolution]
  );

  const handleFreeSudokuInput = useCallback(
    (num: number) => {
      if (sudokuMode !== 'free') return;
      const { r, c } = sudokuSelected;
      setSudokuBoard((prev) => {
        const next = cloneSudokuBoard(prev);
        next[r][c] = num === 0 ? 0 : next[r][c] === num ? 0 : num;
        return next;
      });
    },
    [sudokuMode, sudokuSelected]
  );

  useEffect(() => {
    if (puzzleType !== 'sudoku') return;

    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const { r, c } = sudokuSelected;
      if (e.key === 'ArrowUp') {
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
      } else if (sudokuMode === 'free') {
        if (e.key >= '1' && e.key <= '9') {
          e.preventDefault();
          handleFreeSudokuInput(Number(e.key));
        } else if (
          e.key === 'Backspace' ||
          e.key === 'Delete' ||
          e.key === '0'
        ) {
          e.preventDefault();
          handleFreeSudokuInput(0);
        }
      } else if (sudokuMode === 'carve') {
        if (
          e.key === ' ' ||
          e.key === 'Enter' ||
          e.key === 'Backspace' ||
          e.key === 'Delete'
        ) {
          e.preventDefault();
          handleCarveCellClick(r, c);
        }
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    puzzleType,
    sudokuSelected,
    sudokuMode,
    handleFreeSudokuInput,
    handleCarveCellClick,
  ]);

  // ==================== クロスワード作成用 State ====================
  const [cwRows, setCwRows] = useState(4);
  const [cwCols, setCwCols] = useState(4);
  const [cwRawGrid, setCwRawGrid] = useState<CrosswordCell[][]>(() =>
    createEmptyCrosswordGrid(4, 4)
  );
  const [cwSelected, setCwSelected] = useState<{ r: number; c: number }>({
    r: 0,
    c: 0,
  });
  const [cwToolMode, setCwToolMode] = useState<'char' | 'black'>('char');
  const [cwCreateDirection, setCwCreateDirection] = useState<'across' | 'down'>(
    'across'
  );
  const [cwDraftText, setCwDraftText] = useState('');
  const cwCreateInputRef = useRef<HTMLInputElement | null>(null);
  const [acrossClues, setAcrossClues] = useState<CrosswordClue[]>([]);
  const [downClues, setDownClues] = useState<CrosswordClue[]>([]);

  function handleResizeCrossword(newRows: number, newCols: number) {
    const clampedR = Math.max(3, Math.min(15, newRows));
    const clampedC = Math.max(3, Math.min(15, newCols));
    setCwRows(clampedR);
    setCwCols(clampedC);

    setCwRawGrid((prev) => {
      const next = createEmptyCrosswordGrid(clampedR, clampedC);
      for (let r = 0; r < clampedR; r++) {
        for (let c = 0; c < clampedC; c++) {
          if (prev[r]?.[c]) {
            next[r][c] = { ...prev[r][c] };
          }
        }
      }
      return next;
    });

    setCwSelected((prev) => ({
      r: Math.min(prev.r, clampedR - 1),
      c: Math.min(prev.c, clampedC - 1),
    }));
  }

  const cwNumbered = useMemo(
    () => assignCrosswordNumbers(cwRawGrid),
    [cwRawGrid]
  );

  const cwIsolatedSet = useMemo(() => {
    const isolated = findIsolatedWhiteCells(cwNumbered.grid);
    return new Set(isolated.map((pos) => `${pos.r}-${pos.c}`));
  }, [cwNumbered]);

  useEffect(() => {
    setAcrossClues((prev) => syncCluesWithWords(prev, cwNumbered.acrossWords));
    setDownClues((prev) => syncCluesWithWords(prev, cwNumbered.downWords));
  }, [cwNumbered]);

  const cwValidation = useMemo(() => {
    const boardData: CrosswordBoardData = {
      rows: cwRows,
      cols: cwCols,
      grid: cwNumbered.grid,
      clues: {
        across: acrossClues,
        down: downClues,
      },
    };
    return validateCrosswordCreation(boardData);
  }, [cwRows, cwCols, cwNumbered, acrossClues, downClues]);

  function toggleCrosswordBlack(r: number, c: number) {
    setCwRawGrid((prev) => {
      const next = prev.map((row) => row.map((cell) => ({ ...cell })));
      const nowBlack = !next[r][c].isBlack;
      next[r][c].isBlack = nowBlack;
      if (nowBlack) {
        next[r][c].char = '';
      }
      return next;
    });
  }

  function setCrosswordCellChar(r: number, c: number, rawInput: string) {
    const normalized = normalizeHiraganaChar(rawInput);
    setCwRawGrid((prev) => {
      const next = prev.map((row) => row.map((cell) => ({ ...cell })));
      next[r][c].isBlack = false;
      next[r][c].char = normalized;
      return next;
    });
  }

  function handleCrosswordCreateInput(rawText: string) {
    const chars = Array.from(rawText)
      .map((ch) => normalizeHiraganaChar(ch))
      .filter(Boolean);
    if (chars.length === 0) return;

    let currR = cwSelected.r;
    let currC = cwSelected.c;
    const nextGrid = cwRawGrid.map((row) => row.map((cell) => ({ ...cell })));

    for (const ch of chars) {
      if (nextGrid[currR]?.[currC]?.isBlack) break;
      nextGrid[currR][currC].char = ch;

      if (cwCreateDirection === 'across') {
        if (currC + 1 < cwCols && !nextGrid[currR][currC + 1].isBlack) {
          currC += 1;
        }
      } else {
        if (currR + 1 < cwRows && !nextGrid[currR + 1][currC].isBlack) {
          currR += 1;
        }
      }
    }

    setCwRawGrid(nextGrid);
    setCwSelected({ r: currR, c: currC });
  }

  function handleCrosswordCreateBackspace() {
    const { r, c } = cwSelected;
    if (cwRawGrid[r]?.[c]?.char) {
      setCrosswordCellChar(r, c, '');
      return;
    }

    let prevR = r;
    let prevC = c;
    if (cwCreateDirection === 'across' && c > 0 && !cwRawGrid[r][c - 1].isBlack) {
      prevC = c - 1;
    } else if (
      cwCreateDirection === 'down' &&
      r > 0 &&
      !cwRawGrid[r - 1][c].isBlack
    ) {
      prevR = r - 1;
    }

    if (prevR !== r || prevC !== c) {
      setCrosswordCellChar(prevR, prevC, '');
      setCwSelected({ r: prevR, c: prevC });
    }
  }

  function handleCrosswordArrowKey(dir: 'up' | 'down' | 'left' | 'right') {
    setCwSelected((p) => {
      if (dir === 'up') return { r: (p.r + cwRows - 1) % cwRows, c: p.c };
      if (dir === 'down') return { r: (p.r + 1) % cwRows, c: p.c };
      if (dir === 'left') return { r: p.r, c: (p.c + cwCols - 1) % cwCols };
      return { r: p.r, c: (p.c + 1) % cwCols };
    });
    setCwDraftText('');
  }

  function loadCrosswordTemplate() {
    setCwRows(4);
    setCwCols(4);
    const sampleGrid: CrosswordCell[][] = [
      [
        { isBlack: false, char: 'さ' },
        { isBlack: false, char: 'そ' },
        { isBlack: false, char: 'り' },
        { isBlack: true, char: '' },
      ],
      [
        { isBlack: false, char: 'か' },
        { isBlack: true, char: '' },
        { isBlack: false, char: 'す' },
        { isBlack: false, char: 'し' },
      ],
      [
        { isBlack: false, char: 'な' },
        { isBlack: false, char: 'つ' },
        { isBlack: true, char: '' },
        { isBlack: false, char: 'か' },
      ],
      [
        { isBlack: true, char: '' },
        { isBlack: false, char: 'き' },
        { isBlack: false, char: 'り' },
        { isBlack: true, char: '' },
      ],
    ];
    setCwRawGrid(sampleGrid);
    const numbered = assignCrosswordNumbers(sampleGrid);
    setAcrossClues([
      { number: 1, text: '尾に毒針を持つ砂漠の生き物' },
      { number: 3, text: '酢飯に魚介をのせた和食' },
      { number: 5, text: '海水浴や花火が楽しい季節' },
      { number: 7, text: '朝に視界が白くかすむ現象' },
    ]);
    setDownClues(
      numbered.downWords.map((w) => {
        const defaults: Record<number, string> = {
          1: '海や川を泳ぐ生き物',
          2: 'どんぐりが好きな小動物',
          4: '奈良公園にいるツノのある動物',
          6: '夜空に輝く天体',
        };
        return { number: w.number, text: defaults[w.number] ?? '' };
      })
    );
  }

  // ==================== 公開・アップロード処理 ====================
  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const cleanTitle = title.trim();
    const cleanAuthor = author.trim() || '名無しさん';

    if (!cleanTitle) {
      setSubmitError('パズルのタイトルを入力してください。');
      return;
    }

    const metaNg = checkNgWords([cleanTitle, cleanAuthor]);
    if (metaNg.hasNg) {
      setSubmitError(
        `タイトルまたは製作者名に禁止ワード（「${metaNg.matchedWord}」）が含まれているため公開できません。`
      );
      return;
    }

    if (puzzleType === 'sudoku') {
      const validation = validateUniqueSudoku(sudokuBoard);
      if (validation.status !== 'unique' || !validation.solution) {
        setSubmitError(`唯一解エラー：${validation.message}`);
        return;
      }

      setIsSubmitting(true);
      try {
        const boardData: SudokuBoardData = {
          initialBoard: cloneSudokuBoard(sudokuBoard),
          solutionBoard: cloneSudokuBoard(validation.solution),
        };
        const created = await puzzleRepository.createPuzzle({
          type: 'sudoku',
          title: cleanTitle,
          author: cleanAuthor,
          boardData,
        });
        router.push(`/play/${created.id}`);
      } catch {
        setSubmitError('パズルの保存中にエラーが発生しました。');
        setIsSubmitting(false);
      }
      return;
    }

    const cwBoardData: CrosswordBoardData = {
      rows: cwRows,
      cols: cwCols,
      grid: cwNumbered.grid,
      clues: {
        across: acrossClues.map((c) => ({ ...c, text: c.text.trim() })),
        down: downClues.map((c) => ({ ...c, text: c.text.trim() })),
      },
    };

    const cwCheck = validateCrosswordCreation(cwBoardData);
    if (!cwCheck.valid) {
      setSubmitError(cwCheck.message);
      return;
    }

    const allTextsToCheck: string[] = [
      ...cwNumbered.acrossWords.map((w) => w.answer),
      ...cwNumbered.downWords.map((w) => w.answer),
      ...cwBoardData.clues.across.map((c) => c.text),
      ...cwBoardData.clues.down.map((c) => c.text),
    ];
    const cwNg = checkNgWords(allTextsToCheck);
    if (cwNg.hasNg) {
      setSubmitError(
        `盤面の言葉またはヒント文に禁止ワード（「${cwNg.matchedWord}」）が含まれているため公開できません。`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await puzzleRepository.createPuzzle({
        type: 'crossword',
        title: cleanTitle,
        author: cleanAuthor,
        boardData: cwBoardData,
      });
      router.push(`/play/${created.id}`);
    } catch {
      setSubmitError('パズルの保存中にエラーが発生しました。');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* 上部ナビ */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>一覧へ戻る</span>
        </Link>
      </div>

      {/* ページ見出し & パズル種別選択 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          オリジナルパズルを作成・公開する
        </h1>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          ナンプレは唯一解ソルバーで自動検証され、クロスワードは自動でカギ番号が振られます。
        </p>

        {/* パズル種別切替タブ */}
        <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-slate-100 p-1.5 sm:max-w-md">
          <button
            type="button"
            onClick={() => {
              setPuzzleType('sudoku');
              setSubmitError(null);
            }}
            className={`inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition sm:text-sm ${
              puzzleType === 'sudoku'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid3X3 className="h-4 w-4" />
            <span>ナンプレを作成</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPuzzleType('crossword');
              setSubmitError(null);
            }}
            className={`inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition sm:text-sm ${
              puzzleType === 'crossword'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Hash className="h-4 w-4" />
            <span>クロスワードを作成</span>
          </button>
        </div>

        {/* タイトル・製作者名入力 */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700">
              パズルの題名（必須）
            </label>
            <input
              type="text"
              maxLength={50}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                puzzleType === 'sudoku'
                  ? '例：すっきり解ける！日曜日の脳トレナンプレ'
                  : '例：どうぶつ＆くだものミニクロス（4×4）'
              }
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">
              製作者名（任意・未入力時は「名無しさん」）
            </label>
            <input
              type="text"
              maxLength={25}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="名無しさん"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* ナンプレ作成エディタ */}
      {puzzleType === 'sudoku' && (
        <SudokuCreator
          mode={sudokuMode}
          board={sudokuBoard}
          carveBaseSolution={carveBaseSolution}
          duplicates={sudokuDuplicates}
          validation={sudokuValidation}
          selected={sudokuSelected}
          submitError={submitError}
          isSubmitting={isSubmitting}
          onSwitchMode={handleSwitchSudokuMode}
          onCellClick={(r, c) => {
            if (sudokuMode === 'carve') {
              handleCarveCellClick(r, c);
            } else {
              setSudokuSelected({ r, c });
            }
          }}
          onRegenerateCarveBase={handleRegenerateCarveBase}
          onFreeInput={handleFreeSudokuInput}
          onResetFreeBoard={() => setSudokuBoard(createEmptySudokuBoard())}
          onPublish={handlePublish}
        />
      )}

      {/* クロスワード作成エディタ */}
      {puzzleType === 'crossword' && (
        <CrosswordCreator
          rows={cwRows}
          cols={cwCols}
          rawGrid={cwRawGrid}
          numbered={cwNumbered}
          isolatedSet={cwIsolatedSet}
          selected={cwSelected}
          toolMode={cwToolMode}
          direction={cwCreateDirection}
          draftText={cwDraftText}
          acrossClues={acrossClues}
          downClues={downClues}
          validation={cwValidation}
          submitError={submitError}
          isSubmitting={isSubmitting}
          inputRef={cwCreateInputRef}
          onResize={handleResizeCrossword}
          onLoadTemplate={loadCrosswordTemplate}
          onSetToolMode={setCwToolMode}
          onToggleDirection={() =>
            setCwCreateDirection((d) => (d === 'across' ? 'down' : 'across'))
          }
          onSelectCell={(r, c) => setCwSelected({ r, c })}
          onToggleBlack={toggleCrosswordBlack}
          onDraftTextChange={setCwDraftText}
          onCommitChars={handleCrosswordCreateInput}
          onBackspaceEmpty={handleCrosswordCreateBackspace}
          onArrowKey={handleCrosswordArrowKey}
          onUpdateAcrossClue={(number, text) =>
            setAcrossClues((prev) =>
              prev.map((c) => (c.number === number ? { ...c, text } : c))
            )
          }
          onUpdateDownClue={(number, text) =>
            setDownClues((prev) =>
              prev.map((c) => (c.number === number ? { ...c, text } : c))
            )
          }
          onPublish={handlePublish}
        />
      )}
    </div>
  );
}
