import {
  CrosswordBoardData,
  CrosswordCell,
  CrosswordClue,
} from '@/types/puzzle';

const SMALL_TO_LARGE_MAP: Record<string, string> = {
  ぁ: 'あ',
  ぃ: 'い',
  ぅ: 'う',
  ぇ: 'え',
  ぉ: 'お',
  っ: 'つ',
  ゃ: 'や',
  ゅ: 'ゆ',
  ょ: 'よ',
  ゎ: 'わ',
  ゕ: 'か',
  ゖ: 'け',
};

const ROMAJI_TABLE: Record<string, string> = {
  a: 'あ',
  i: 'い',
  u: 'う',
  e: 'え',
  o: 'お',
  ka: 'か',
  ki: 'き',
  ku: 'く',
  ke: 'け',
  ko: 'こ',
  sa: 'さ',
  si: 'し',
  shi: 'し',
  su: 'す',
  se: 'せ',
  so: 'そ',
  ta: 'た',
  ti: 'ち',
  chi: 'ち',
  tu: 'つ',
  tsu: 'つ',
  te: 'て',
  to: 'と',
  na: 'な',
  ni: 'に',
  nu: 'ぬ',
  ne: 'ね',
  no: 'の',
  ha: 'は',
  hi: 'ひ',
  hu: 'ふ',
  fu: 'ふ',
  he: 'へ',
  ho: 'ほ',
  ma: 'ま',
  mi: 'み',
  mu: 'む',
  me: 'め',
  mo: 'も',
  ya: 'や',
  yu: 'ゆ',
  yo: 'よ',
  ra: 'ら',
  ri: 'り',
  ru: 'る',
  re: 'れ',
  ro: 'ろ',
  wa: 'わ',
  wo: 'を',
  nn: 'ん',
  "n'": 'ん',
  xn: 'ん',
  ga: 'が',
  gi: 'ぎ',
  gu: 'ぐ',
  ge: 'げ',
  go: 'ご',
  za: 'ざ',
  zi: 'じ',
  ji: 'じ',
  zu: 'ず',
  ze: 'ぜ',
  zo: 'ぞ',
  da: 'だ',
  di: 'ぢ',
  du: 'づ',
  dzu: 'づ',
  de: 'で',
  do: 'ど',
  ba: 'ば',
  bi: 'び',
  bu: 'ぶ',
  be: 'べ',
  bo: 'ぼ',
  pa: 'ぱ',
  pi: 'ぴ',
  pu: 'ぷ',
  pe: 'ぺ',
  po: 'ぽ',
  // 拗音（小文字は大文字正規化ルールに従い2文字へ展開、または1文字ずつ入力）
  kya: 'きや',
  kyu: 'きゆ',
  kyo: 'きよ',
  sha: 'しや',
  sya: 'しや',
  shu: 'しゆ',
  syu: 'しゆ',
  sho: 'しよ',
  syo: 'しよ',
  cha: 'ちや',
  tya: 'ちや',
  cya: 'ちや',
  chu: 'ちゆ',
  tyu: 'ちゆ',
  cyu: 'ちゆ',
  cho: 'ちよ',
  tyo: 'ちよ',
  cyo: 'ちよ',
  nya: 'にや',
  nyu: 'にゆ',
  nyo: 'によ',
  hya: 'ひや',
  hyu: 'ひゆ',
  hyo: 'ひよ',
  mya: 'みや',
  myu: 'みゆ',
  myo: 'みよ',
  rya: 'りや',
  ryu: 'りゆ',
  ryo: 'りよ',
  gya: 'ぎや',
  gyu: 'ぎゆ',
  gyo: 'ぎよ',
  ja: 'じや',
  jya: 'じや',
  zya: 'じや',
  ju: 'じゆ',
  jyu: 'じゆ',
  zyu: 'じゆ',
  jo: 'じよ',
  jyo: 'じよ',
  zyo: 'じよ',
  dya: 'ぢや',
  dyu: 'ぢゆ',
  dyo: 'ぢよ',
  bya: 'びや',
  byu: 'びゆ',
  byo: 'びよ',
  pya: 'ぴや',
  pyu: 'ぴゆ',
  pyo: 'ぴよ',
  // 小文字直接入力（大文字へ正規化）
  xa: 'あ',
  la: 'あ',
  xi: 'い',
  li: 'い',
  xu: 'う',
  lu: 'う',
  xe: 'え',
  le: 'え',
  xo: 'お',
  lo: 'お',
  xtu: 'つ',
  xtsu: 'つ',
  ltu: 'つ',
  ltsu: 'つ',
  xya: 'や',
  lya: 'や',
  xyu: 'ゆ',
  lyu: 'ゆ',
  xyo: 'よ',
  lyo: 'よ',
  xwa: 'わ',
  lwa: 'わ',
  '-': 'ー',
  'ー': 'ー',
};

/**
 * カタカナをひらがなに変換し、小文字（っ、ゃ、ゅ、ょ、ぁ、ぃ、ぅ、ぇ、ぉ、ゎ）を
 * 大文字（つ、や、ゆ、よ、あ、い、う、え、お、わ）に正規化する。
 * ひらがな以外の文字は除去し、先頭1文字のみを返す。
 */
export function normalizeHiraganaChar(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (!trimmed) return '';

  const rawChar = Array.from(trimmed)[0];

  // カタカナ (ァ-ヶ) を ひらがな に変換
  const code = rawChar.charCodeAt(0);
  let hira = rawChar;
  if (code >= 0x30a1 && code <= 0x30f6) {
    hira = String.fromCharCode(code - 0x60);
  }

  // 小文字→大文字正規化
  if (SMALL_TO_LARGE_MAP[hira]) {
    hira = SMALL_TO_LARGE_MAP[hira];
  }

  // 有効なひらがな（あ〜ん、ー）か判定
  if (/^[あ-んー]$/.test(hira)) {
    return hira;
  }

  return '';
}

/**
 * 文字列全体を正規化されたひらがな文字列に変換する
 */
export function normalizeHiraganaString(input: string): string {
  if (!input) return '';
  return Array.from(input)
    .map((ch) => normalizeHiraganaChar(ch))
    .join('');
}

/**
 * ひらがな・カタカナ・ローマ字が混在した入力文字列を解析し、
 * 確定した正規化ひらがな文字列（converted）と、まだローマ字入力途中の未確定バッファ（pending）に分ける。
 * これにより、IMEがONでもOFF（直接ローマ字入力）でも「ka → か」が快適に入力できる。
 */
export function extractHiraganaAndPendingRomaji(rawInput: string): {
  converted: string;
  pending: string;
} {
  if (!rawInput) return { converted: '', pending: '' };

  // 全角英字を半角英字に揃え、小文字化する
  const normalizedInput = rawInput
    .replace(/[Ａ-Ｚａ-ｚ]/g, (s) =>
      String.fromCharCode(s.charCodeAt(0) - 0xfee0)
    )
    .toLowerCase();

  let converted = '';
  let romajiBuffer = '';

  function flushBuffer(forceAll: boolean) {
    while (romajiBuffer.length > 0) {
      // 完全一致チェック
      if (ROMAJI_TABLE[romajiBuffer]) {
        converted += ROMAJI_TABLE[romajiBuffer];
        romajiBuffer = '';
        return;
      }

      // 促音（っ→つ）：同じ子音が2つ続いた場合（例: kka -> つ + ka）
      if (
        romajiBuffer.length >= 2 &&
        romajiBuffer[0] === romajiBuffer[1] &&
        /^[bcdfghjklmpqrstvwxyz]$/.test(romajiBuffer[0]) &&
        romajiBuffer[0] !== 'n'
      ) {
        converted += 'つ';
        romajiBuffer = romajiBuffer.slice(1);
        continue;
      }

      // n の後に母音・y・n 以外の子音が来た場合は「ん」を確定（例: n + k -> ん + k）
      if (
        romajiBuffer.length >= 2 &&
        romajiBuffer[0] === 'n' &&
        !/^[aiueoyn']$/.test(romajiBuffer[1])
      ) {
        converted += 'ん';
        romajiBuffer = romajiBuffer.slice(1);
        continue;
      }

      // 先頭から一致するローマ字があるかチェック
      let matchedPrefixLen = 0;
      for (let len = Math.min(4, romajiBuffer.length); len >= 1; len--) {
        const sub = romajiBuffer.slice(0, len);
        if (ROMAJI_TABLE[sub]) {
          converted += ROMAJI_TABLE[sub];
          romajiBuffer = romajiBuffer.slice(len);
          matchedPrefixLen = len;
          break;
        }
      }
      if (matchedPrefixLen > 0) {
        continue;
      }

      // まだ途中の有効なプレフィックス（例: "k", "sh", "ch", "ts", "ky", "n"）か判定
      const isPrefix = Object.keys(ROMAJI_TABLE).some((key) =>
        key.startsWith(romajiBuffer)
      );
      if (isPrefix && !forceAll) {
        return;
      }

      // プレフィックスとして成立しない先頭1文字を破棄して次へ
      if (forceAll && romajiBuffer === 'n') {
        converted += 'ん';
        romajiBuffer = '';
        return;
      }
      romajiBuffer = romajiBuffer.slice(1);
    }
  }

  for (const ch of Array.from(normalizedInput)) {
    const hira = normalizeHiraganaChar(ch);
    if (hira) {
      // ひらがな・カタカナが来たら直前のローマ字バッファをクリアして追加
      if (romajiBuffer === 'n') {
        converted += 'ん';
      }
      romajiBuffer = '';
      converted += hira;
    } else if (/^[a-z\-']$/.test(ch)) {
      romajiBuffer += ch;
      flushBuffer(false);
    }
  }

  return {
    converted,
    pending: romajiBuffer,
  };
}

export interface CrosswordWordInfo {
  number: number;
  direction: 'across' | 'down';
  startRow: number;
  startCol: number;
  cells: { r: number; c: number }[];
  answer: string;
}

export interface AutoNumberResult {
  grid: CrosswordCell[][];
  acrossWords: CrosswordWordInfo[];
  downWords: CrosswordWordInfo[];
}

/**
 * クロスワードの標準ルールに従って左上から順に自動で番号（1, 2, 3...）を割り振る
 * - ヨコのカギ先頭: 白マス かつ (左端 または 左隣が黒マス) かつ (右隣が白マス = 2文字以上)
 * - タテのカギ先頭: 白マス かつ (上端 または 上隣が黒マス) かつ (下隣が白マス = 2文字以上)
 */
export function assignCrosswordNumbers(
  rawGrid: CrosswordCell[][]
): AutoNumberResult {
  const rows = rawGrid.length;
  const cols = rows > 0 ? rawGrid[0].length : 0;

  const grid: CrosswordCell[][] = rawGrid.map((row) =>
    row.map((cell) => ({
      isBlack: Boolean(cell.isBlack),
      char: cell.isBlack ? '' : normalizeHiraganaChar(cell.char),
      clueNumber: undefined,
    }))
  );

  const acrossWords: CrosswordWordInfo[] = [];
  const downWords: CrosswordWordInfo[] = [];
  let currentNumber = 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].isBlack) continue;

      const startsAcross =
        (c === 0 || grid[r][c - 1].isBlack) &&
        c + 1 < cols &&
        !grid[r][c + 1].isBlack;

      const startsDown =
        (r === 0 || grid[r - 1][c].isBlack) &&
        r + 1 < rows &&
        !grid[r + 1][c].isBlack;

      if (startsAcross || startsDown) {
        const assignedNum = currentNumber++;
        grid[r][c].clueNumber = assignedNum;

        if (startsAcross) {
          const cells: { r: number; c: number }[] = [];
          let answer = '';
          let cc = c;
          while (cc < cols && !grid[r][cc].isBlack) {
            cells.push({ r, c: cc });
            answer += grid[r][cc].char || '？';
            cc++;
          }
          acrossWords.push({
            number: assignedNum,
            direction: 'across',
            startRow: r,
            startCol: c,
            cells,
            answer,
          });
        }

        if (startsDown) {
          const cells: { r: number; c: number }[] = [];
          let answer = '';
          let rr = r;
          while (rr < rows && !grid[rr][c].isBlack) {
            cells.push({ r: rr, c });
            answer += grid[rr][c].char || '？';
            rr++;
          }
          downWords.push({
            number: assignedNum,
            direction: 'down',
            startRow: r,
            startCol: c,
            cells,
            answer,
          });
        }
      }
    }
  }

  return { grid, acrossWords, downWords };
}

/**
 * 指定サイズの空のクロスワードグリッドを作成する
 */
export function createEmptyCrosswordGrid(
  rows: number,
  cols: number
): CrosswordCell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isBlack: false,
      char: '',
    }))
  );
}

/**
 * 既存のヒント文リストと新しい自動採番ワードリストをマージする
 */
export function syncCluesWithWords(
  existingClues: CrosswordClue[],
  words: CrosswordWordInfo[]
): CrosswordClue[] {
  const textByNum = new Map<number, string>();
  existingClues.forEach((c) => {
    textByNum.set(c.number, c.text);
  });

  return words.map((w) => ({
    number: w.number,
    text: textByNum.get(w.number) ?? '',
  }));
}

/**
 * タテ・ヨコどちらの単語（2文字以上）にも属していない孤立した1マスの白マスを検出する
 */
export function findIsolatedWhiteCells(
  grid: CrosswordCell[][]
): { r: number; c: number }[] {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  const isolated: { r: number; c: number }[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].isBlack) continue;
      const hasHorizontalNeighbor =
        (c > 0 && !grid[r][c - 1].isBlack) ||
        (c + 1 < cols && !grid[r][c + 1].isBlack);
      const hasVerticalNeighbor =
        (r > 0 && !grid[r - 1][c].isBlack) ||
        (r + 1 < rows && !grid[r + 1][c].isBlack);

      if (!hasHorizontalNeighbor && !hasVerticalNeighbor) {
        isolated.push({ r, c });
      }
    }
  }

  return isolated;
}

/**
 * クロスワード作成時のバリデーションを行う
 */
export function validateCrosswordCreation(boardData: CrosswordBoardData): {
  valid: boolean;
  message: string;
} {
  const { rows, cols, grid, clues } = boardData;
  if (rows < 3 || rows > 15 || cols < 3 || cols > 15) {
    return {
      valid: false,
      message: '盤面サイズは3×3〜15×15の範囲で指定してください。',
    };
  }

  // 孤立した1マス白マスのチェック
  const isolatedCells = findIsolatedWhiteCells(grid);
  if (isolatedCells.length > 0) {
    const first = isolatedCells[0];
    return {
      valid: false,
      message: `タテ・ヨコどちらのカギ（2文字以上の単語）にも含まれない孤立した白マスがあります（${first.r + 1}行目・${first.c + 1}列目）。黒マスにするか2文字以上つながるように配置してください。`,
    };
  }

  let whiteCount = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      if (!cell.isBlack) {
        whiteCount++;
        const normalized = normalizeHiraganaChar(cell.char);
        if (!normalized) {
          return {
            valid: false,
            message: `文字が入っていない白マスがあります（${r + 1}行目・${c + 1}列目）。すべての白マスにひらがな1文字を入力するか黒マスにしてください。`,
          };
        }
      }
    }
  }

  if (whiteCount < 2) {
    return {
      valid: false,
      message: '白マスが少なすぎます。2文字以上続く単語を作ってください。',
    };
  }

  const { acrossWords, downWords } = assignCrosswordNumbers(grid);
  if (acrossWords.length === 0 && downWords.length === 0) {
    return {
      valid: false,
      message:
        'タテまたはヨコに2文字以上続く白マス（カギ）が1つもありません。',
    };
  }

  for (const w of acrossWords) {
    const clue = clues.across.find((c) => c.number === w.number);
    if (!clue || !clue.text.trim()) {
      return {
        valid: false,
        message: `「ヨコのカギ ${w.number}番（答え：${w.answer}）」のヒント文が未入力です。`,
      };
    }
  }

  for (const w of downWords) {
    const clue = clues.down.find((c) => c.number === w.number);
    if (!clue || !clue.text.trim()) {
      return {
        valid: false,
        message: `「タテのカギ ${w.number}番（答え：${w.answer}）」のヒント文が未入力です。`,
      };
    }
  }

  return {
    valid: true,
    message: 'すべての白マスとカギの入力が完了しています！公開可能です。',
  };
}

/**
 * クロスワードのすべての白マスが正解の文字と一致しているか判定する
 */
export function isCrosswordCleared(
  boardData: CrosswordBoardData,
  userInputs: string[][]
): boolean {
  for (let r = 0; r < boardData.rows; r++) {
    for (let c = 0; c < boardData.cols; c++) {
      const cell = boardData.grid[r][c];
      if (!cell.isBlack) {
        const expected = normalizeHiraganaChar(cell.char);
        const actual = normalizeHiraganaChar(userInputs[r]?.[c] ?? '');
        if (!expected || actual !== expected) {
          return false;
        }
      }
    }
  }
  return true;
}
