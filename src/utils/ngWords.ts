/**
 * NGワードリスト（不適切表現・スパム・暴力的表現等のフィルタリング用）
 */
export const NG_WORDS: string[] = [
  'しね',
  '死ね',
  'ころす',
  '殺す',
  'ばか',
  '馬鹿',
  'あほ',
  'アホ',
  'くず',
  'クズ',
  'ごみ',
  'ゴミ',
  'きえろ',
  '消えろ',
  'うざい',
  'ウザい',
  'きもい',
  'キモい',
  'ちんこ',
  'まんこ',
  'うんこ',
  'セックス',
  'せっくす',
  'エロ',
  'えろ',
  '暴力',
  'ぼうりょく',
  '犯罪',
  'はんざい',
  '闇バイト',
  'やみばいと',
  '詐欺',
  'さぎ',
  '麻薬',
  'まやく',
  '覚せい剤',
  'かくせいざい',
  '自殺',
  'じさつ',
];

export interface NgCheckResult {
  hasNg: boolean;
  matchedWord?: string;
}

/**
 * テキストまたはテキスト配列の中にNGワードが含まれているか判定する
 */
export function checkNgWords(texts: string | string[]): NgCheckResult {
  const list = Array.isArray(texts) ? texts : [texts];
  for (const rawText of list) {
    if (!rawText) continue;
    const normalized = rawText.toLowerCase().replace(/\s+/g, '');
    for (const word of NG_WORDS) {
      if (normalized.includes(word.toLowerCase())) {
        return {
          hasNg: true,
          matchedWord: word,
        };
      }
    }
  }
  return { hasNg: false };
}
