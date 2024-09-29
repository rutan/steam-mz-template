import { relative } from "node:path";
import ignore from "ignore";

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

// Asar パッケージ化を行うかどうか
const useAsar = process.env.SKIP_ASAR !== "1";

export default {
  packagerConfig: {
    name: "My Game",
    asar: useAsar,
    ignore: (filePath) => {
      const relativePath = relative("/", filePath);
      return packageIgnore.ignores(relativePath);
    },
  },
  plugins: [
    // steamworks.js などの native モジュールを asar から除外するためのプラグイン
    useAsar && {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {},
    },
  ].filter(Boolean),
};
