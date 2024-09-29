import { app } from "electron";
import {
  init as initSteam,
  restartAppIfNecessary,
  electronEnableSteamOverlay,
} from "steamworks.js";

export class SteamApi {
  #steamAppId;
  #client = null;

  /**
   * クライアントの生成
   * @param {number} steamAppId
   */
  constructor(steamAppId) {
    this.#steamAppId = steamAppId;
  }

  /**
   * Steamクライアント
   * @returns {import('steamworks.js').Client}
   */
  get client() {
    return this.#client;
  }

  /**
   * Steamクライアントの初期化
   * @returns Steamクライアントの初期化に成功したかどうか
   */
  init() {
    if (!this.#checkLaunchBySteam()) return false;

    this.#client = initSteam(this.#steamAppId);
    electronEnableSteamOverlay(true);

    return true;
  }

  /**
   * Steam経由での起動かどうかをチェック
   * @returns {boolean}
   */
  #checkLaunchBySteam() {
    // パッケージ化されていない場合（＝開発中）はSteam経由起動とみなす
    if (!app.isPackaged) return true;

    return !restartAppIfNecessary(this.#steamAppId);
  }
}
