export type PuzzleType = 'sudoku' | 'crossword';

export interface BasePuzzle {
  id: string;              // UUID (crypto.randomUUID())
  type: PuzzleType;
  title: string;           // パズルの題名
  author: string;          // 製作者名（未入力時は「名無しさん」等のデフォルト値）
  playCount: number;       // プレイ画面を開いた累計回数
  clearCount: number;      // クリアした累計回数
  reportCount: number;     // 通報回数（一定数以上で一覧から非表示）
  searchKeywords: string[]; // タイトルと製作者名から自動生成した1〜2文字のN-gram配列（将来のFirestore検索用）
  createdAt: string;       // ISO日時文字列
  boardData: SudokuBoardData | CrosswordBoardData; // Firestore保存時はJSON文字列化
}

// ナンプレ用データ
export interface SudokuBoardData {
  initialBoard: number[][];  // 9x9（0は空白、1〜9は初期配置数字）
  solutionBoard: number[][]; // 9x9（1〜9の完成解答）
}

// クロスワード用データ
export interface CrosswordCell {
  isBlack: boolean;       // 黒マスかどうか
  char: string;           // 正解のひらがな1文字（大文字正規化済み、黒マスの場合は空文字）
  clueNumber?: number;    // タテ・ヨコのカギ番号（該当する場合のみ1, 2, 3...）
}

export interface CrosswordClue {
  number: number;
  text: string;           // ヒント文
}

export interface CrosswordBoardData {
  rows: number;           // 3〜15
  cols: number;           // 3〜15
  grid: CrosswordCell[][];
  clues: {
    across: CrosswordClue[]; // ヨコのカギ
    down: CrosswordClue[];   // タテのカギ
  };
}

// Firestore保存用シリアライズデータ型
export interface SerializedPuzzle extends Omit<BasePuzzle, 'boardData'> {
  boardData: string;
}
