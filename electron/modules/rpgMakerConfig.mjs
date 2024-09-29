import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";

/**
 * ツクールMZのプラグイン設定ファイルの読み込み
 * @param {string} pluginsJsPath ツクールMZ の plugins.js のパス
 * @returns {Promise<Array<*>>}
 */
export async function readRpgMakerPluginConfigAll(pluginsJsPath) {
  const pluginsJs = await readFile(pluginsJsPath, "utf8");
  return parsePluginJs(pluginsJs);
}

/**
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
 * ツクールMZのプラグイン設定ファイルの読み込み（同期処理版）
 * @param {string} pluginsJsPath ツクールMZ の plugins.js のパス
 * @returns {Array<*>}
 */
export function readSyncRpgMakerPluginConfigAllFromProject(pluginsJsPath) {
  const pluginsJs = readFileSync(pluginsJsPath, "utf8");
  return parsePluginJs(pluginsJs);
}

/**
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
  return JSON.parse(
    `[${pluginJs
      .split(/\r?\n/)
      .filter((line) => line.startsWith("{"))
      .join("")}]`
  );
}
