import { join, dirname } from "node:path";
import { app, shell, ipcMain } from "electron";
import { Store } from "./Store.mjs";

/**
 * Registers processing for the bridge.
 * ブリッジ用の処理を登録
 * @param {Object} params
 * @param {Electron.BrowserWindow} params.browserWindow
 * @param {import('./steam.mjs').SteamApi} params.steamApi
 */
export async function registerBridge({ browserWindow, steamApi }) {
  await registerBridgeAppBehavior(browserWindow);
  await registerBridgeFullScreen(browserWindow);
  await registerBridgeStore(steamApi);
  await registerBridgeAchievements(steamApi);
}

/**
 * Registers application behavior processing.
 * アプリケーションの動作系の処理を登録
 * @param {import('electron').BrowserWindow} browserWindow
 */
async function registerBridgeAppBehavior(browserWindow) {
  ipcMain.handle("exitApp", () => {
    browserWindow.close();
  });

  ipcMain.handle("openUrl", (_e, { url }) => {
    if (isValidWebUrl(url)) {
      shell.openExternal(url);
    }
    return true;
  });

  // Handle external links opened from within the game
  // ゲーム内から開いた外部リンクをデフォルトのブラウザで開く
  browserWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isValidWebUrl(url)) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });
}

/**
 * Registers full-screen related processing.
 * フルスクリーン系の処理を登録
 * @param {import('electron').BrowserWindow} browserWindow
 */
async function registerBridgeFullScreen(browserWindow) {
  browserWindow.fullScreen;

  ipcMain.handle("getFullScreen", (_e) => {
    return browserWindow.isFullScreen();
  });

  ipcMain.handle("setFullScreen", (_e, { isFullScreen }) => {
    const fullScreenValue = Boolean(isFullScreen);
    browserWindow.setFullScreen(fullScreenValue);
  });

  browserWindow.on("enter-full-screen", () => {
    browserWindow.webContents.send("steam:changeFullScreen", {
      isFullScreen: true,
    });
  });

  browserWindow.on("leave-full-screen", () => {
    browserWindow.webContents.send("steam:changeFullScreen", {
      isFullScreen: false,
    });
  });
}

/**
 * Registers save data related processing.
 * セーブデータ系の処理を登録
 * @param {import('./steam.mjs').SteamApi} steamApi
 */
async function registerBridgeStore(steamApi) {
  const playerId = steamApi.client.localplayer.getSteamId();
  const storePath = join(
    dirname(app.getPath("exe")),
    "save",
    String(playerId.steamId64),
  );
  const store = new Store(storePath);

  ipcMain.handle("readSaveData", (_e, { saveName }) => {
    return store.read(saveName);
  });

  ipcMain.handle("writeSaveData", (_e, { saveName, zip }) => {
    return store.write(saveName, zip);
  });

  ipcMain.handle("existsSaveData", (_e, { saveName }) => {
    return store.exists(saveName);
  });

  ipcMain.handle("removeSaveData", (_e, { saveName }) => {
    return store.remove(saveName);
  });
}

/**
 * Registers achievement related processing.
 * 実績系の処理を登録
 * @param {import('./steam.mjs').SteamApi} steamApi
 */
async function registerBridgeAchievements(steamApi) {
  ipcMain.handle("isActivatedAchievement", (_e, { achievementName }) => {
    return steamApi.client.achievement.isActivated(achievementName);
  });

  ipcMain.handle("activateAchievement", (_e, { achievementName }) => {
    return steamApi.client.achievement.activate(achievementName);
  });

  ipcMain.handle("deactivateAchievement", (_e, { achievementName }) => {
    return steamApi.client.achievement.clear(achievementName);
  });
}

/**
 * Checks if a URL is a valid web URL.
 * URLが有効なWebのURLかどうかを判定する
 * @param {string} url
 * @returns {boolean}
 */
function isValidWebUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}
