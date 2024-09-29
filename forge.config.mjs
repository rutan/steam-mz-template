import { join, relative } from "node:path";
import ignore from "ignore";
import { APP_DIR_PATH } from "./electron/constants.mjs";
import { readSyncRpgMakerPluginConfig } from "./electron/modules/rpgMakerConfig.mjs";

const pluginConfig = readSyncRpgMakerPluginConfig(
  join(APP_DIR_PATH, "js/plugins.js"),
  "SteamPlugin"
);
const packageName = pluginConfig?.parameters?.packageName ?? "my-game";
const useAsar = String(pluginConfig?.parameters?.useAsar ?? true) === "true";

// パッケージに含めないファイルを指定
const packageIgnore = ignore();
packageIgnore.add([
  // 開発系のファイル
  ".gitignore",
  "/README.md",
  "/plugins",
  "/forge.config.js",

  // ツクールのプロジェクトファイル
  "/app/game.rmmzproject",

  // ツクールのセーブフォルダ
  "/app/save",
]);

export default {
  packagerConfig: {
    name: packageName,
    asar: useAsar && {
      unpackDir: 'node_modules/steamworks.js/dist',
    },
    ignore: (filePath) => {
      const relativePath = relative("/", filePath);
      return packageIgnore.ignores(relativePath);
    },
  }
};
