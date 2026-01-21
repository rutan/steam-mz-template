import { join } from "node:path";
import { readFileSync } from "node:fs";
import { readSyncRpgMakerPluginConfig } from "./modules/rpgMakerConfig.mjs";
import { APP_DIR_PATH } from "./constants.mjs";
import { app, BrowserWindow } from "electron";
import { registerBridge } from "./modules/bridge.mjs";
import { SteamApi } from "./modules/steam.mjs";

// Settings to use GPU in the renderer process
// Note that these settings must be applied before any other processing,
// otherwise the Steam overlay will not work properly.
// レンダラープロセスでGPUを利用するための設定
// すべての処理より先にこの設定をしないと、Steamオーバーレイが正常に動作しないため注意
app.commandLine.appendSwitch("in-process-gpu");
app.commandLine.appendSwitch("disable-direct-composition");

// Quit the application when all windows are closed
// ウィンドウを閉じたらアプリケーションを終了する
app.on("window-all-closed", () => {
  app.exit();
});

/**
 * Loads the plugin configuration.
 * プラグイン設定を読み込む
 * @returns {{ steamAppId: number, useDeveloperToolsInDebugMode: boolean } | undefined}
 */
function loadPluginConfig() {
  const pluginConfig = readSyncRpgMakerPluginConfig(
    join(APP_DIR_PATH, "js/plugins.js"),
    "SteamPlugin",
  );
  if (!pluginConfig) return;

  return {
    steamAppId: Number(pluginConfig.parameters.steamAppId ?? 0),
    useDeveloperToolsInDebugMode:
      String(
        pluginConfig.parameters.useDeveloperToolsInDebugMode ?? "false",
      ) === "true",
  };
}

(async () => {
  const pluginConfig = loadPluginConfig();

  if (!pluginConfig) {
    console.error("SteamPlugin is not found.");
    return;
  }

  // Get the screen size from the game's package info
  // ゲーム側のパッケージ情報から画面サイズを取得
  const appPackageJson = JSON.parse(
    readFileSync(join(APP_DIR_PATH, "package.json")),
  );
  const screenWidth = appPackageJson.window?.width ?? 816;
  const screenHeight = appPackageJson.window?.height ?? 624;

  // Initialize Steamworks API
  // Steamworks の初期化
  const steamApi = new SteamApi(pluginConfig.steamAppId);
  if (!steamApi.init()) {
    app.exit();
    return;
  }

  // Initialize Electron
  // Electronの初期化完了待ち
  await app.whenReady();

  // Create the window
  // ウィンドウを作成
  const mainWindow = new BrowserWindow({
    webPreferences: {
      // Preload script to load before startup
      // 起動前に読み込むスクリプト
      preload: join(import.meta.dirname, "preload.cjs"),

      // Disable Node.js features in the renderer process
      // レンダラープロセスでNode.jsの機能を利用しない
      nodeIntegration: false,

      // Enable context isolation in the renderer process
      // レンダラープロセスでコンテキスト分離を有効化
      contextIsolation: true,
    },

    // Depending on the PC settings, the size of the window border may vary,
    // which may cause the resolution to not be the intended size.
    // Therefore, the window is hidden immediately after creation.
    // PCの設定によってウィンドウの縁のサイズが異なり、
    // 解像度が意図したサイズにならない場合があるため、
    // ウィンドウ作成直後はウィンドウを非表示にする
    show: false,
  });

  // Remove the Electron menu bar
  // Electronのメニューバーを削除
  mainWindow.removeMenu();

  // Set the window size
  // ウィンドウのサイズを設定
  mainWindow.setContentSize(screenWidth, screenHeight);

  // Prevent the window from being resized to smaller than the specified size
  // 指定したサイズ以下にウィンドウを縮小できないように
  mainWindow.setMinimumSize(...mainWindow.getSize());

  // Register processing for the bridge
  // ブリッジ用の処理を登録
  await registerBridge({
    steamApi,
    browserWindow: mainWindow,
  });

  // Load the game
  // ゲームを読み込む
  await mainWindow.loadFile(join(APP_DIR_PATH, "index.html"));

  // If in development and enabled in plugin settings, show developer tools
  // 開発中かつプラグイン設定で有効にしている場合は開発者ツールを表示
  if (!app.isPackaged && pluginConfig.useDeveloperToolsInDebugMode) {
    mainWindow.webContents.openDevTools();
  }

  // Show the window
  // ウィンドウを表示
  mainWindow.show();
  mainWindow.focus();
})();
