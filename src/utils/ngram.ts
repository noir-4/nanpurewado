/**
 * タイトルと製作者名から1文字（Uni-gram）および2文字（Bi-gram）のN-gram配列を生成する
 * 将来Firestoreの `array-contains` 検索に即座に切り替えられるように保存時に自動生成する
 */
export function generateSearchKeywords(...texts: string[]): string[] {
  const keywordSet = new Set<string>();

  for (const text of texts) {
    if (!text) continue;
    // 空白類を除去し小文字正規化
    const cleaned = text.trim().toLowerCase().replace(/\s+/g, '');
    const chars = Array.from(cleaned);

    // Uni-gram (1文字)
    for (let i = 0; i < chars.length; i++) {
      keywordSet.add(chars[i]);
    }

    // Bi-gram (2文字)
    for (let i = 0; i < chars.length - 1; i++) {
      keywordSet.add(chars[i] + chars[i + 1]);
    }
  }

  return Array.from(keywordSet);
}
