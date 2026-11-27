export type SudokuValidationStatus =
  | 'unique'
  | 'none'
  | 'multiple'
  | 'invalid_duplicates'
  | 'no_holes';

export interface SudokuValidationResult {
  status: SudokuValidationStatus;
  count: number;
  solution?: number[][];
  message: string;
}

/**
 * 9x9の空盤面（すべて0）を生成する
 */
export function createEmptySudokuBoard(): number[][] {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

/**
 * 盤面のディープコピーを作成する
 */
export function cloneSudokuBoard(board: number[][]): number[][] {
  return board.map((row) => [...row]);
}

/**
 * 現在の盤面上で「同じヨコ行」「同じタテ列」「同じ3x3ブロック」内に
 * 同じ数字（1〜9）が2つ以上存在する場合、該当する全マスの位置を true として返す
 */
export function findDuplicateCells(board: number[][]): boolean[][] {
  const duplicates: boolean[][] = Array.from({ length: 9 }, () =>
    Array(9).fill(false)
  );

  // ヨコ行の重複チェック
  for (let r = 0; r < 9; r++) {
    const positionsByNum = new Map<number, number[]>();
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val >= 1 && val <= 9) {
        const list = positionsByNum.get(val) ?? [];
        list.push(c);
        positionsByNum.set(val, list);
      }
    }
    positionsByNum.forEach((cols) => {
      if (cols.length >= 2) {
        cols.forEach((c) => {
          duplicates[r][c] = true;
        });
      }
    });
  }

  // タテ列の重複チェック
  for (let c = 0; c < 9; c++) {
    const positionsByNum = new Map<number, number[]>();
    for (let r = 0; r < 9; r++) {
      const val = board[r][c];
      if (val >= 1 && val <= 9) {
        const list = positionsByNum.get(val) ?? [];
        list.push(r);
        positionsByNum.set(val, list);
      }
    }
    positionsByNum.forEach((rows) => {
      if (rows.length >= 2) {
        rows.forEach((r) => {
          duplicates[r][c] = true;
        });
      }
    });
  }

  // 3x3ブロックの重複チェック
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const positionsByNum = new Map<number, [number, number][]>();
      for (let dr = 0; dr < 3; dr++) {
        for (let dc = 0; dc < 3; dc++) {
          const r = br * 3 + dr;
          const c = bc * 3 + dc;
          const val = board[r][c];
          if (val >= 1 && val <= 9) {
            const list = positionsByNum.get(val) ?? [];
            list.push([r, c]);
            positionsByNum.set(val, list);
          }
        }
      }
      positionsByNum.forEach((coords) => {
        if (coords.length >= 2) {
          coords.forEach(([r, c]) => {
            duplicates[r][c] = true;
          });
        }
      });
    }
  }

  return duplicates;
}

/**
 * 盤面に重複エラーが1つでもあるか判定する
 */
export function hasAnyDuplicates(board: number[][]): boolean {
  const dup = findDuplicateCells(board);
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (dup[r][c]) return true;
    }
  }
  return false;
}

/**
 * 全81マスが1〜9で埋まり、かつ重複エラーが0件であるか（クリア状態か）判定する
 */
export function isSudokuCleared(board: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = board[r][c];
      if (v < 1 || v > 9) return false;
    }
  }
  return !hasAnyDuplicates(board);
}

/**
 * 指定マス(r, c)に num を配置可能か判定する
 */
function canPlaceNumber(
  board: number[][],
  r: number,
  c: number,
  num: number
): boolean {
  for (let i = 0; i < 9; i++) {
    if (board[r][i] === num) return false;
    if (board[i][c] === num) return false;
  }
  const startR = Math.floor(r / 3) * 3;
  const startC = Math.floor(c / 3) * 3;
  for (let dr = 0; dr < 3; dr++) {
    for (let dc = 0; dc < 3; dc++) {
      if (board[startR + dr][startC + dc] === num) return false;
    }
  }
  return true;
}

/**
 * 配列をシャッフルする（Fisher-Yates）
 */
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * バックトラッキング法でランダムな9x9完成盤面を生成する
 */
export function generateCompleteSudokuBoard(): number[][] {
  const board = createEmptySudokuBoard();

  function fillCell(index: number): boolean {
    if (index === 81) return true;
    const r = Math.floor(index / 9);
    const c = index % 9;
    const candidates = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    for (const num of candidates) {
      if (canPlaceNumber(board, r, c, num)) {
        board[r][c] = num;
        if (fillCell(index + 1)) return true;
        board[r][c] = 0;
      }
    }
    return false;
  }

  fillCell(0);
  return board;
}

/**
 * バックトラッキング法（MRVヒューリスティック付き）で解の個数をカウントし、唯一解かどうかを検証する
 * 解が2つ見つかった時点で探索を打ち切るため、空白が多い盤面でも高速に動作する
 */
export function validateUniqueSudoku(
  initialBoard: number[][]
): SudokuValidationResult {
  // 1. 現在の配置自体に重複違反がないかチェック
  if (hasAnyDuplicates(initialBoard)) {
    return {
      status: 'invalid_duplicates',
      count: 0,
      message:
        '同じタテ列・ヨコ行・3×3ブロック内に重複している数字があります。赤字のマスを修正してください。',
    };
  }

  // 2. 空白マスが1つ以上あるかチェック
  let emptyCount = 0;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (initialBoard[r][c] === 0) emptyCount++;
    }
  }

  if (emptyCount === 0) {
    return {
      status: 'no_holes',
      count: 1,
      solution: cloneSudokuBoard(initialBoard),
      message:
        '空白マス（穴）が1つもありません。プレイヤーが解けるよう、少なくとも1マス以上を空白にしてください。',
    };
  }

  // ビットマスクで高速に候補管理（bit 1..9）
  const rowMask = new Int32Array(9);
  const colMask = new Int32Array(9);
  const boxMask = new Int32Array(9);
  const work = cloneSudokuBoard(initialBoard);

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = work[r][c];
      if (val !== 0) {
        const bit = 1 << val;
        const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
        rowMask[r] |= bit;
        colMask[c] |= bit;
        boxMask[b] |= bit;
      }
    }
  }

  let solutionsCount = 0;
  let firstSolution: number[][] | undefined;

  function countBits(mask: number): number {
    let cnt = 0;
    let m = mask;
    while (m) {
      m &= m - 1;
      cnt++;
    }
    return cnt;
  }

  function search(): void {
    if (solutionsCount >= 2) return;

    // MRV: 候補数が最小の空白マスを選ぶ
    let bestR = -1;
    let bestC = -1;
    let bestAvailableMask = 0;
    let minCandidates = 10;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (work[r][c] === 0) {
          const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
          const used = rowMask[r] | colMask[c] | boxMask[b];
          const available = ~used & 0x3fe; // bits 1..9
          if (available === 0) {
            return; // この枝は行き止まり
          }
          const numCand = countBits(available);
          if (numCand < minCandidates) {
            minCandidates = numCand;
            bestR = r;
            bestC = c;
            bestAvailableMask = available;
            if (numCand === 1) break;
          }
        }
      }
      if (minCandidates === 1) break;
    }

    // 空白マスがなくなれば解を1つ発見
    if (bestR === -1) {
      solutionsCount++;
      if (!firstSolution) {
        firstSolution = cloneSudokuBoard(work);
      }
      return;
    }

    const b = Math.floor(bestR / 3) * 3 + Math.floor(bestC / 3);
    for (let num = 1; num <= 9; num++) {
      const bit = 1 << num;
      if (bestAvailableMask & bit) {
        work[bestR][bestC] = num;
        rowMask[bestR] |= bit;
        colMask[bestC] |= bit;
        boxMask[b] |= bit;

        search();

        work[bestR][bestC] = 0;
        rowMask[bestR] &= ~bit;
        colMask[bestC] &= ~bit;
        boxMask[b] &= ~bit;

        if (solutionsCount >= 2) return;
      }
    }
  }

  search();

  if (solutionsCount === 0) {
    return {
      status: 'none',
      count: 0,
      message:
        'この盤面には解が存在しません（解の個数: 0）。数字の配置を見直してください。',
    };
  }

  if (solutionsCount === 1 && firstSolution) {
    return {
      status: 'unique',
      count: 1,
      solution: firstSolution,
      message: '唯一解（解がちょうど1つ）であることが確認されました！公開可能です。',
    };
  }

  return {
    status: 'multiple',
    count: solutionsCount,
    message:
      '解が2通り以上存在します（複数解）。唯一解になるようヒント数字を追加するか、穴を減らしてください。',
  };
}

/**
 * 完成盤面から唯一解を保ったまま指定個数前後の穴をランダムに空ける補助関数
 */
export function carveUniqueHoles(
  solutionBoard: number[][],
  targetHoles = 42
): number[][] {
  const board = cloneSudokuBoard(solutionBoard);
  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }
  const shuffled = shuffleArray(positions);
  let carved = 0;

  for (const [r, c] of shuffled) {
    if (carved >= targetHoles) break;
    const backup = board[r][c];
    board[r][c] = 0;
    const res = validateUniqueSudoku(board);
    if (res.status === 'unique') {
      carved++;
    } else {
      board[r][c] = backup;
    }
  }

  return board;
}
