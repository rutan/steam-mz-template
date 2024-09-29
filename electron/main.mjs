import { join } from "node:path";
import { readFile } from "node:fs/promises";
import { readRpgMakerPluginConfig } from "./modules/rpgMakerConfig.mjs";
import { APP_DIR_PATH } from "./constants.mjs";
import { app, BrowserWindow } from "electron";
import { registerBridge } from "./modules/bridge.mjs";
import { SteamApi } from "./modules/steam.mjs";

// レンダラープロセスでGPUを利用するための設定
// すべての処理より先にこの設定をしないと、Steamオーバーレイが正常に動作しないため注意
app.commandLine.appendSwitch("in-process-gpu");
app.commandLine.appendSwitch("disable-direct-composition");

// ウィンドウを閉じたらアプリケーションを終了する
app.on("window-all-closed", () => {
  app.exit();
});

async function loadPluginConfig() {
  const pluginConfig = await readRpgMakerPluginConfig(
    join(APP_DIR_PATH, "js/plugins.js"),
    "SteamPlugin"
  );
  if (!pluginConfig) return;

  return {
    steamAppId: Number(pluginConfig.parameters.steamAppId ?? 0),
    useDeveloperToolsInDebugMode:
      String(pluginConfig.parameters.useDeveloperToolsInDebugMode ?? 'false') === "true",
  };
}

(async () => {
  // ツクール側のプラグイン設定を読み込む
  const pluginConfig = await loadPluginConfig();

  if (!pluginConfig) {
    console.error("SteamPlugin is not found.");
    return;
  }

  // ゲーム側のパッケージ情報から画面サイズを取得
  const appPackageJson = JSON.parse(
    await readFile(join(APP_DIR_PATH, "package.json"))
  );
  const screenWidth = appPackageJson.window?.width ?? 816;
  const screenHeight = appPackageJson.window?.height ?? 624;

  // Steamworks の初期化
  const steamApi = new SteamApi(pluginConfig.steamAppId);
  if (!steamApi.init()) {
    app.exit();
    return;
  }

  // Electronの初期化完了待ち
  await app.whenReady();

  // ウィンドウを作成
  const mainWindow = new BrowserWindow({
    webPreferences: {
      // 起動前に読み込むスクリプト
      preload: join(import.meta.dirname, "preload.cjs"),
      // レンダラープロセスでNode.jsの機能を利用しない
      nodeIntegration: false,
      // レンダラープロセスでコンテキスト分離を有効化
      contextIsolation: true,
    },
    // PCの設定によってウィンドウの縁のサイズが異なり、
    // 解像度が意図したサイズにならない場合があるため、
    // ウィンドウ作成直後はウィンドウを非表示にする
    show: false,
  });

  // Electronのメニューバーを削除
  mainWindow.removeMenu();

  // ウィンドウのサイズを設定
  mainWindow.setContentSize(screenWidth, screenHeight);

  // 指定したサイズ以下にウィンドウを縮小できないように
  mainWindow.setMinimumSize(...mainWindow.getSize());

  // ブリッジ用の処理を登録
  await registerBridge({
    steamApi,
    browserWindow: mainWindow,
  });

  // ゲームを読み込む
  await mainWindow.loadFile(join(APP_DIR_PATH, "index.html"));

  // 開発中かつプラグイン設定で有効にしている場合は開発者ツールを表示
  if (!app.isPackaged && pluginConfig.useDeveloperToolsInDebugMode) {
    mainWindow.webContents.openDevTools();
  }

  // ウィンドウを表示
  mainWindow.show();
  mainWindow.focus();
})();
