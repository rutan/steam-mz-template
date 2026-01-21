import { basename, join, relative } from "node:path";
import { normalize as normalizePosix } from "node:path/posix";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import ignore from "ignore";
import pngToIco from "png-to-ico";
import { APP_DIR_PATH } from "./electron/constants.mjs";
import { readSyncRpgMakerPluginConfig } from "./electron/modules/rpgMakerConfig.mjs";
import { searchJsFiles } from "./scripts/searchJsFiles.mjs";
import { readPluginComment } from "./scripts/readPluginComment.mjs";

const pluginConfig = readSyncRpgMakerPluginConfig(
  join(APP_DIR_PATH, "js/plugins.js"),
  "SteamPlugin",
);
const packageName = pluginConfig?.parameters?.packageName ?? "my-game";
const packageVersion = pluginConfig?.parameters?.packageVersion ?? "0.0.0";
const packageCopyright = pluginConfig?.parameters?.packageCopyright ?? "";
const useAsar = String(pluginConfig?.parameters?.useAsar ?? true) === "true";
const useOutputPluginHeaders =
  String(pluginConfig?.parameters?.useOutputPluginHeaders ?? false) === "true";

// パッケージに含めるディレクトリ・ファイル
const includeDirsOrFiles = ["/app", "/electron", "/node_modules", "/package.json"];

// パッケージに含めないファイルを指定
const packageIgnore = ignore();
packageIgnore.add([
  // ツクールのプロジェクトファイルを除外
  "/app/game.rmmzproject",

  // ツクールのセーブフォルダを除外
  "/app/save/",
]);

const iconFilePath = join(APP_DIR_PATH, "icon/icon.ico");
const pngFilePath = join(APP_DIR_PATH, "icon/icon.png");
const tmpDirPath = join("tmp");
const tmpIconDirPath = join(tmpDirPath, "icon");
const tmpPluginHeadersFilePath = join(tmpDirPath, "PLUGIN_HEADERS.txt");

function isTargetFile(filePath) {
  return includeDirsOrFiles.some((dirPath) => {
    const relativePath = relative(dirPath, filePath);
    return !relativePath.startsWith("..");
  });
}

async function copyOrCreateIcon() {
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
}

async function generatePluginHeadersFile() {
  await mkdir(tmpDirPath, { recursive: true });

  const contents = [];
  const jsFiles = await searchJsFiles(join(APP_DIR_PATH, "js", "plugins"));
  for (const filePath of jsFiles) {
    console.log(`Processing: ${filePath}`);
    const code = await readFile(filePath, "utf-8");
    const result = await readPluginComment(code);
    contents.push([`// ===== Plugin: ${basename(filePath)} =====`, result].join("\n"));
  }

  await writeFile(tmpPluginHeadersFilePath, contents.join("\n\n\n"), "utf-8");
}

export default {
  packagerConfig: {
    name: packageName,
    icon: join(tmpIconDirPath, "icon"),
    asar: useAsar && {
      unpackDir: "node_modules/steamworks.js/dist",
    },
    ignore: (filePath) => {
      const normalizedFilePath = normalizePosix(filePath);

      // カレントディレクトリは許可
      if (normalizedFilePath === ".") return false;

      // パッケージに含めるディレクトリ外のファイルは除外
      if (!isTargetFile(normalizedFilePath)) return true;

      // ignore のルールに従って除外
      const relativePath = normalizePosix(relative("/", normalizedFilePath));
      return packageIgnore.ignores(relativePath);
    },
    appVersion: packageVersion,
    appCopyright: packageCopyright,
    extraResource: [useOutputPluginHeaders ? tmpPluginHeadersFilePath : undefined].filter(Boolean),
  },
  hooks: {
    prePackage: async () => {
      if (useOutputPluginHeaders) {
        await generatePluginHeadersFile();
      }
      await copyOrCreateIcon();
    },
  },
};
