import { BasePuzzle, CrosswordBoardData } from '@/types/puzzle';
import { assignCrosswordNumbers } from '@/utils/crosswordLogic';
import { generateSearchKeywords } from '@/utils/ngram';

/**
 * 初回アクセス時に自動投入するサンプルデータ（ナンプレ2問・クロスワード2問）
 */
export function createInitialSamplePuzzles(): BasePuzzle[] {
  // --- ナンプレ サンプル1: 初心者向け ---
  const sudoku1Solution: number[][] = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ];
  const sudoku1Initial: number[][] = [
    [5, 3, 0, 0, 7, 0, 0, 1, 2],
    [6, 0, 2, 1, 9, 5, 0, 4, 8],
    [0, 9, 8, 0, 4, 0, 5, 6, 0],
    [8, 0, 9, 0, 6, 1, 0, 2, 3],
    [4, 2, 0, 8, 0, 3, 0, 9, 1],
    [7, 1, 0, 9, 2, 0, 8, 0, 6],
    [0, 6, 1, 0, 3, 0, 2, 8, 0],
    [2, 8, 0, 4, 1, 9, 6, 0, 5],
    [3, 4, 0, 0, 8, 0, 0, 7, 9],
  ];

  // --- ナンプレ サンプル2: 中級 ---
  const sudoku2Solution: number[][] = [
    [4, 3, 5, 2, 6, 9, 7, 8, 1],
    [6, 8, 2, 5, 7, 1, 4, 9, 3],
    [1, 9, 7, 8, 3, 4, 5, 6, 2],
    [8, 2, 6, 1, 9, 5, 3, 4, 7],
    [3, 7, 4, 6, 8, 2, 9, 1, 5],
    [9, 5, 1, 7, 4, 3, 6, 2, 8],
    [5, 1, 9, 3, 2, 6, 8, 7, 4],
    [2, 4, 8, 9, 5, 7, 1, 3, 6],
    [7, 6, 3, 4, 1, 8, 2, 5, 9],
  ];
  const sudoku2Initial: number[][] = [
    [0, 3, 0, 2, 6, 0, 7, 0, 1],
    [6, 8, 0, 0, 7, 0, 0, 9, 0],
    [1, 9, 0, 0, 0, 4, 5, 0, 0],
    [8, 2, 0, 1, 0, 0, 0, 4, 0],
    [0, 0, 4, 6, 0, 2, 9, 0, 0],
    [0, 5, 0, 0, 0, 3, 0, 2, 8],
    [0, 0, 9, 3, 0, 0, 0, 7, 4],
    [0, 4, 0, 0, 5, 0, 0, 3, 6],
    [7, 0, 3, 0, 1, 8, 0, 0, 0],
  ];

  // --- クロスワード サンプル1: 4x4 いきものと季節のミニクロス ---
  const cw1Raw = [
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
  const cw1Numbered = assignCrosswordNumbers(cw1Raw);
  const cw1Board: CrosswordBoardData = {
    rows: 4,
    cols: 4,
    grid: cw1Numbered.grid,
    clues: {
      across: [
        { number: 1, text: '星座にもなっている、尾に毒針を持つ砂漠の生き物' },
        { number: 3, text: '酢飯の上に新鮮な魚介をのせた代表的な日本料理' },
        { number: 5, text: '海や花火、かき氷が楽しい暑い季節' },
        { number: 7, text: '朝や山道で視界が白くかすむ自然現象' },
      ],
      down: [
        { number: 1, text: '海や川を泳ぐ生き物。漢字で書くと「魚」' },
        { number: 2, text: '木の実を頬袋にためる、大きな尻尾の小動物' },
        { number: 4, text: '奈良公園でせんべいをもらうツノのある動物' },
        { number: 6, text: '夜空に浮かび、満ち欠けする天体' },
      ],
    },
  };

  // --- クロスワード サンプル2: 5x5 暮らしと自然のクロスワード ---
  const cw2Raw = [
    [
      { isBlack: false, char: 'ぱ' },
      { isBlack: false, char: 'そ' },
      { isBlack: false, char: 'こ' },
      { isBlack: false, char: 'ん' },
      { isBlack: true, char: '' },
    ],
    [
      { isBlack: false, char: 'ん' },
      { isBlack: true, char: '' },
      { isBlack: false, char: 'く' },
      { isBlack: true, char: '' },
      { isBlack: false, char: 'す' },
    ],
    [
      { isBlack: false, char: 'だ' },
      { isBlack: false, char: 'ん' },
      { isBlack: false, char: 'ご' },
      { isBlack: true, char: '' },
      { isBlack: false, char: 'い' },
    ],
    [
      { isBlack: true, char: '' },
      { isBlack: true, char: '' },
      { isBlack: true, char: '' },
      { isBlack: false, char: 'し' },
      { isBlack: false, char: 'か' },
    ],
    [
      { isBlack: true, char: '' },
      { isBlack: false, char: 'く' },
      { isBlack: false, char: 'る' },
      { isBlack: false, char: 'ま' },
      { isBlack: true, char: '' },
    ],
  ];
  const cw2Numbered = assignCrosswordNumbers(cw2Raw);
  const cw2Board: CrosswordBoardData = {
    rows: 5,
    cols: 5,
    grid: cw2Numbered.grid,
    clues: {
      across: [
        { number: 1, text: 'キーボードやマウスで操作するデスク上の情報機器' },
        { number: 4, text: '串に刺さった丸い和菓子。「花より○○○」' },
        {
          number: 5,
          text: '立派な角を持つ森の動物。紅葉（もみじ）とセットの絵札でもおなじみ',
        },
        { number: 6, text: 'タイヤが4つ付いていて道路を走る乗り物' },
      ],
      down: [
        { number: 1, text: '白と黒の模様がかわいい、笹を食べる動物' },
        { number: 2, text: '学校の授業で日本語の読み書きや物語を学ぶ教科' },
        { number: 3, text: '緑と黒の縞模様で、夏に冷やして食べる大きな果物' },
        { number: 5, text: '四方を海に囲まれた陸地のこと' },
      ],
    },
  };

  return [
    {
      id: 'sample-sudoku-1',
      type: 'sudoku',
      title: '【入門】サクッと解ける基本のナンプレ',
      author: '公式編集部',
      playCount: 42,
      clearCount: 35,
      reportCount: 0,
      searchKeywords: generateSearchKeywords(
        '【入門】サクッと解ける基本のナンプレ',
        '公式編集部'
      ),
      createdAt: '2026-11-15T09:00:00.000Z',
      boardData: {
        initialBoard: sudoku1Initial,
        solutionBoard: sudoku1Solution,
      },
    },
    {
      id: 'sample-sudoku-2',
      type: 'sudoku',
      title: '【中級】じっくり思考する王道ナンプレ',
      author: 'パズル職人K',
      playCount: 28,
      clearCount: 16,
      reportCount: 0,
      searchKeywords: generateSearchKeywords(
        '【中級】じっくり思考する王道ナンプレ',
        'パズル職人K'
      ),
      createdAt: '2026-11-16T12:30:00.000Z',
      boardData: {
        initialBoard: sudoku2Initial,
        solutionBoard: sudoku2Solution,
      },
    },
    {
      id: 'sample-crossword-1',
      type: 'crossword',
      title: 'いきものと季節のミニクロス（4×4）',
      author: '公式編集部',
      playCount: 51,
      clearCount: 44,
      reportCount: 0,
      searchKeywords: generateSearchKeywords(
        'いきものと季節のミニクロス（4×4）',
        '公式編集部'
      ),
      createdAt: '2026-11-15T15:00:00.000Z',
      boardData: cw1Board,
    },
    {
      id: 'sample-crossword-2',
      type: 'crossword',
      title: '暮らしと自然のクロスワード（5×5）',
      author: 'ことば博士',
      playCount: 33,
      clearCount: 24,
      reportCount: 0,
      searchKeywords: generateSearchKeywords(
        '暮らしと自然のクロスワード（5×5）',
        'ことば博士'
      ),
      createdAt: '2026-11-16T18:20:00.000Z',
      boardData: cw2Board,
    },
  ];
}
