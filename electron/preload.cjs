const { contextBridge, ipcRenderer } = require("electron");

const applicationState = {
  isFullScreen: false,
};

contextBridge.exposeInMainWorld("steam", {
  /**
   * アプリケーションの終了
   */
  exitApp() {
    return ipcRenderer.invoke("exitApp");
  },

  /**
   * 外部URLをブラウザで開く
   * @param {string} url
   */
  openUrl(url) {
    return ipcRenderer.invoke("openUrl", { url });
  },

  /**
   * セーブデータの読み込み
   * @param {string} saveName
   */
  readSaveData(saveName) {
    return ipcRenderer.invoke("readSaveData", {
      saveName,
    });
  },

  /**
   * セーブデータの書き込み
   * @param {string} saveName
   * @param {string} zip
   */
  writeSaveData(saveName, zip) {
    return ipcRenderer.invoke("writeSaveData", {
      saveName,
      zip,
    });
  },

  /**
   * セーブデータの存在確認
   * @param {string} saveName
   */
  existsSaveData(saveName) {
    return ipcRenderer.invoke("existsSaveData", {
      saveName,
    });
  },

  /**
   * セーブデータの削除
   * @param {string} saveName
   */
  removeSaveData(saveName) {
    return ipcRenderer.invoke("removeSaveData", {
      saveName,
    });
  },

  /**
   * フルスクリーン状態の取得
   */
  isFullScreen() {
    return applicationState.isFullScreen;
  },

  /**
   * フルスクリーンの設定
   * @param {boolean} isFullScreen
   */
  setFullScreen(isFullScreen) {
    return ipcRenderer.invoke("setFullScreen", {
      isFullScreen,
    });
  },

  /**
   * 実績の獲得状態の確認
   * @param {string} achievementName
   */
  isActivatedAchievement(achievementName) {
    return ipcRenderer.invoke("isActivatedAchievement", { achievementName });
  },

  /**
   * 実績の獲得
   * @param {string} achievementName
   */
  activateAchievement(achievementName) {
    return ipcRenderer.invoke("activateAchievement", { achievementName });
  },

  /**
   * 実績の解除
   * @param {string} achievementName
   */
  deactivateAchievement(achievementName) {
    return ipcRenderer.invoke("deactivateAchievement", { achievementName });
  },
});

ipcRenderer.addListener("steam:changeFullScreen", (_e, { isFullScreen }) => {
  applicationState.isFullScreen = isFullScreen;
});
