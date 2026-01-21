import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";

/**
 * Reads the RPG Maker MZ plugin configuration file.
 * ツクールMZのプラグイン設定ファイルの読み込み
 * @param {string} pluginsJsPath ツクールMZ の plugins.js のパス
 * @returns {Promise<Array<*>>}
 */
export async function readRpgMakerPluginConfigAll(pluginsJsPath) {
  const pluginsJs = await readFile(pluginsJsPath, "utf8");
  return parsePluginJs(pluginsJs);
}

/**
 * Reads the specified RPG Maker MZ plugin configuration.
 * ツクールMZの指定プラグインの設定の読み込み
 * @param {string} pluginsJsPath ツクールMZ の plugins.js のパス
 * @param {string} pluginName プラグイン名
 * @returns {Promise<*>}
 */
export async function readRpgMakerPluginConfig(pluginsJsPath, pluginName) {
  const plugins = await readRpgMakerPluginConfigAll(pluginsJsPath);
  return plugins.find((plugin) => plugin.name === pluginName);
}

/**
 * Reads RPG Maker MZ plugin configuration file (synchronous version).
 * ツクールMZのプラグイン設定ファイルの読み込み（同期処理版）
 * @param {string} pluginsJsPath ツクールMZ の plugins.js のパス
 * @returns {Array<*>}
 */
export function readSyncRpgMakerPluginConfigAllFromProject(pluginsJsPath) {
  const pluginsJs = readFileSync(pluginsJsPath, "utf8");
  return parsePluginJs(pluginsJs);
}

/**
 * Reads the specified RPG Maker MZ plugin configuration (synchronous version).
 * ツクールMZの指定プラグインの設定の読み込み（同期処理版）
 * @param {string} pluginsJsPath ツクールMZ の plugins.js のパス
 * @param {string} pluginName プラグイン名
 * @returns {*}
 */
export function readSyncRpgMakerPluginConfig(pluginsJsPath, pluginName) {
  const plugins = readSyncRpgMakerPluginConfigAllFromProject(pluginsJsPath);
  return plugins.find((plugin) => plugin.name === pluginName);
}

function parsePluginJs(pluginJs) {
  const jsonString = pluginJs
    .split(/\r?\n/)
    .filter((line) => {
      // コメント行を削除
      if (line.startsWith("//")) return false;

      // var $plugins = 行を削除
      if (line.startsWith("var $plugins =")) return false;

      return true;
    })
    .join("")
    .trim()
    .replace(/;$/, ""); // 末尾のセミコロンを除去

  return JSON.parse(jsonString);
}
