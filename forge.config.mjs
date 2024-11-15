import { join, relative } from "node:path";
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import ignore from "ignore";
import pngToIco from "png-to-ico";
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

const iconFilePath = join(APP_DIR_PATH, "icon/icon.ico");
const pngFilePath = join(APP_DIR_PATH, "icon/icon.png");
const tmpDirPath = join("tmp");
const tmpIconDirPath = join(tmpDirPath, "icon");

export default {
  packagerConfig: {
    name: packageName,
    icon: join(tmpIconDirPath, "icon"),
    asar: useAsar && {
      unpackDir: "node_modules/steamworks.js/dist",
    },
    ignore: (filePath) => {
      const relativePath = relative("/", filePath);
      return packageIgnore.ignores(relativePath);
    },
  },
  hooks: {
    // パッケージング前にアイコンを用意するフック
    prePackage: async () => {
      await mkdir(tmpIconDirPath, { recursive: true });

      const tmpIconFilePath = join(tmpIconDirPath, "icon.ico");

      try {
        await copyFile(iconFilePath, tmpIconFilePath);
      } catch (_) {
        // ICO ファイルが存在しない場合は PNG から ICO を生成
        await pngToIco(pngFilePath).then((buffer) => {
          return writeFile(tmpIconFilePath, buffer);
        });
      }
    },
  },
};
