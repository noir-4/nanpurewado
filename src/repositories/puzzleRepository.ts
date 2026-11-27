import {
  BasePuzzle,
  CrosswordBoardData,
  PuzzleType,
  SerializedPuzzle,
  SudokuBoardData,
} from '@/types/puzzle';
import { generateSearchKeywords } from '@/utils/ngram';
import { createInitialSamplePuzzles } from '@/repositories/samplePuzzles';
import { getApps, initializeApp } from 'firebase/app';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'nanpurewado_puzzles_v1';
const SEEDED_FLAG_KEY = 'nanpurewado_seeded_v1';
export const REPORT_HIDE_THRESHOLD = 3;

function getStorageMode(): 'local' | 'firebase' {
  const mode = process.env.NEXT_PUBLIC_STORAGE_MODE;
  return mode === 'firebase' ? 'firebase' : 'local';
}

function getFirestoreDb() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  const app =
    getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  return getFirestore(app);
}

/**
 * Firestore制約（2次元配列の直接保存不可）に対応するため、
 * 保存時に boardData を JSON.stringify() でシリアライズする
 */
function serializePuzzle(puzzle: BasePuzzle): SerializedPuzzle {
  return {
    ...puzzle,
    boardData: JSON.stringify(puzzle.boardData),
  };
}

/**
 * 取得時にシリアライズされた boardData を JSON.parse() で復元する
 */
function deserializePuzzle(raw: SerializedPuzzle | BasePuzzle): BasePuzzle {
  const parsedBoardData =
    typeof raw.boardData === 'string'
      ? (JSON.parse(raw.boardData) as SudokuBoardData | CrosswordBoardData)
      : raw.boardData;

  return {
    ...raw,
    playCount: Number(raw.playCount ?? 0),
    clearCount: Number(raw.clearCount ?? 0),
    reportCount: Number(raw.reportCount ?? 0),
    searchKeywords: Array.isArray(raw.searchKeywords) ? raw.searchKeywords : [],
    boardData: parsedBoardData,
  };
}

function seedSamplesToLocalStorage(): BasePuzzle[] {
  const samples = createInitialSamplePuzzles();
  if (typeof window !== 'undefined') {
    const serialized = samples.map(serializePuzzle);
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serialized));
    window.localStorage.setItem(SEEDED_FLAG_KEY, 'true');
  }
  return samples;
}

/**
 * localStorage からシリアライズ済みデータを読み込む（未投入時はサンプルデータを自動投入）
 */
function readLocalPuzzles(): BasePuzzle[] {
  if (typeof window === 'undefined') return [];

  const isSeeded = window.localStorage.getItem(SEEDED_FLAG_KEY);
  const rawJson = window.localStorage.getItem(LOCAL_STORAGE_KEY);

  if (!isSeeded || !rawJson) {
    return seedSamplesToLocalStorage();
  }

  try {
    const parsed = JSON.parse(rawJson) as SerializedPuzzle[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return seedSamplesToLocalStorage();
    }
    return parsed.map(deserializePuzzle);
  } catch {
    return seedSamplesToLocalStorage();
  }
}

function writeLocalPuzzles(puzzles: BasePuzzle[]): void {
  if (typeof window === 'undefined') return;
  const serialized = puzzles.map(serializePuzzle);
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serialized));
}

export interface CreatePuzzleInput {
  type: PuzzleType;
  title: string;
  author: string;
  boardData: SudokuBoardData | CrosswordBoardData;
}

/**
 * パズルデータアクセス層（Repositoryパターン）
 * NEXT_PUBLIC_STORAGE_MODE=local | firebase により環境変数で切り替え可能
 */
export const puzzleRepository = {
  /**
   * 公開パズル一覧を取得する（通報数が閾値以上のものは除外）
   */
  async getPuzzles(type?: PuzzleType): Promise<BasePuzzle[]> {
    if (getStorageMode() === 'firebase') {
      const db = getFirestoreDb();
      const colRef = collection(db, 'puzzles');
      const q = type
        ? query(colRef, where('type', '==', type), orderBy('createdAt', 'desc'))
        : query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list: BasePuzzle[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data() as SerializedPuzzle;
        const puzzle = deserializePuzzle({ ...data, id: docSnap.id });
        if (puzzle.reportCount < REPORT_HIDE_THRESHOLD) {
          list.push(puzzle);
        }
      });
      return list;
    }

    const all = readLocalPuzzles();
    return all.filter(
      (p) =>
        p.reportCount < REPORT_HIDE_THRESHOLD && (!type || p.type === type)
    );
  },

  /**
   * ID指定で単一パズルを取得する
   */
  async getPuzzleById(id: string): Promise<BasePuzzle | null> {
    if (getStorageMode() === 'firebase') {
      const db = getFirestoreDb();
      const docRef = doc(db, 'puzzles', id);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      const data = snap.data() as SerializedPuzzle;
      return deserializePuzzle({ ...data, id: snap.id });
    }

    const all = readLocalPuzzles();
    return all.find((p) => p.id === id) ?? null;
  },

  /**
   * 新規パズルを保存する（searchKeywords自動生成・boardDataのJSON文字列化を内部で実行）
   */
  async createPuzzle(input: CreatePuzzleInput): Promise<BasePuzzle> {
    const cleanTitle = input.title.trim();
    const cleanAuthor = input.author.trim() || '名無しさん';
    const newPuzzle: BasePuzzle = {
      id:
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `puzzle-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: input.type,
      title: cleanTitle,
      author: cleanAuthor,
      playCount: 0,
      clearCount: 0,
      reportCount: 0,
      searchKeywords: generateSearchKeywords(cleanTitle, cleanAuthor),
      createdAt: new Date().toISOString(),
      boardData: input.boardData,
    };

    if (getStorageMode() === 'firebase') {
      const db = getFirestoreDb();
      const serialized = serializePuzzle(newPuzzle);
      await setDoc(doc(db, 'puzzles', newPuzzle.id), serialized);
      return newPuzzle;
    }

    const all = readLocalPuzzles();
    writeLocalPuzzles([newPuzzle, ...all]);
    return newPuzzle;
  },

  /**
   * プレイ回数を +1 加算する（Firestore移行時は increment(1) を使用）
   */
  async incrementPlayCount(id: string): Promise<void> {
    if (getStorageMode() === 'firebase') {
      const db = getFirestoreDb();
      await updateDoc(doc(db, 'puzzles', id), {
        playCount: increment(1),
      });
      return;
    }

    const all = readLocalPuzzles();
    writeLocalPuzzles(
      all.map((p) => (p.id === id ? { ...p, playCount: p.playCount + 1 } : p))
    );
  },

  /**
   * クリア回数を +1 加算する（Firestore移行時は increment(1) を使用）
   */
  async incrementClearCount(id: string): Promise<void> {
    if (getStorageMode() === 'firebase') {
      const db = getFirestoreDb();
      await updateDoc(doc(db, 'puzzles', id), {
        clearCount: increment(1),
      });
      return;
    }

    const all = readLocalPuzzles();
    writeLocalPuzzles(
      all.map((p) => (p.id === id ? { ...p, clearCount: p.clearCount + 1 } : p))
    );
  },

  /**
   * 通報回数を +1 加算する（3回以上に達したパズルは一覧取得から除外される）
   */
  async incrementReportCount(id: string): Promise<number> {
    if (getStorageMode() === 'firebase') {
      const db = getFirestoreDb();
      const docRef = doc(db, 'puzzles', id);
      await updateDoc(docRef, {
        reportCount: increment(1),
      });
      const snap = await getDoc(docRef);
      const data = snap.data() as SerializedPuzzle | undefined;
      return Number(data?.reportCount ?? 1);
    }

    const all = readLocalPuzzles();
    let newCount = 0;
    const updated = all.map((p) => {
      if (p.id === id) {
        newCount = p.reportCount + 1;
        return { ...p, reportCount: newCount };
      }
      return p;
    });
    writeLocalPuzzles(updated);
    return newCount;
  },
};
