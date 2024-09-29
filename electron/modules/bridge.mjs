import { join, dirname } from "node:path";
import { app, ipcMain } from "electron";
import { Store } from "./Store.mjs";

/**
 * ブリッジ用の処理を登録
 * @param {Object} params
 * @param {Electron.BrowserWindow} params.browserWindow
 * @param {import('./steam.mjs').SteamApi} params.steamApi
 */
export async function registerBridge({ browserWindow, steamApi }) {
  await registerBridgeFullScreen(browserWindow);
  await registerBridgeStore(steamApi);
  await registerBridgeAchievements(steamApi);
}

/**
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
 * セーブデータ系の処理を登録
 * @param {import('./steam.mjs').SteamApi} steamApi
 */
async function registerBridgeStore(steamApi) {
  const playerId = steamApi.client.localplayer.getSteamId();
  const storePath = join(
    dirname(app.getPath("exe")),
    "save",
    String(playerId.steamId64)
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
