import { readdir } from "node:fs/promises";
import { resolve, join } from "node:path";

/**
 * 指定ディレクトリ以下にあるすべての.jsファイルを再帰的に検索し、絶対パスの配列として返す。
 * @note node v22 以降であれば glob に置き換え可能
 * @param {string} rootDir
 * @returns {Promise<string[]>} 絶対パスの配列
 */
export async function searchJsFiles(rootDir) {
  const results = [];
  const rootAbs = resolve(rootDir);

  async function walk(dirAbs) {
    const entries = await readdir(dirAbs, { withFileTypes: true });
    for (const ent of entries) {
      const abs = join(dirAbs, ent.name);
      if (ent.isDirectory()) {
        await walk(abs);
      } else if (ent.isFile() && abs.endsWith(".js")) {
        results.push(abs);
      }
    }
  }

  await walk(rootAbs);
  return results.sort();
}
