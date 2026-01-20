/*---------------------------------------------------------------------------*
 * SteamPlugin.js
 *---------------------------------------------------------------------------*
 * Ruたん ( @ru_shalm )
 * https://github.com/rutan/steam-mz-template
 *---------------------------------------------------------------------------*/

/*:
 * @target MZ
 * @plugindesc Steam Plugin for Steam Template
 * @author Rutan (ru_shalm)
 * @url https://github.com/rutan/steam-mz-template
 * @license MIT License
 * @base PluginCommonBase
 * @orderAfter PluginCommonBase
 * @help
 * This is a plugin for the Steam template.
 *
 * @param base
 * @text ■ Basic Settings
 *
 * @param steamAppId
 * @parent base
 * @text Steam App ID
 * @desc Specify the App ID of this game on Steam.
 * @type number
 * @default 0
 *
 * @param packaging
 * @text ■ Packaging Settings
 *
 * @param packageName
 * @parent packaging
 * @text Package Name
 * @desc Specify the name when packaging.
 * (Alphanumeric characters only are recommended)
 * @type string
 * @default my-game
 *
 * @param packageVersion
 * @parent packaging
 * @text Version Information
 * @desc Specify the version information when packaging.
 * Example: 1.0.0
 * @type string
 * @default 1.0.0
 *
 * @param packageCopyright
 * @parent packaging
 * @text Copyright Information
 * @desc Specify the copyright information when packaging.
 * Example: (c) 2025 Rutan
 * @type string
 * @default RPG Maker MZ
 *
 * @param useAsar
 * @parent packaging
 * @text Use ASAR Archive?
 * @desc Specify whether to bundle the game content into an ASAR archive file to make it harder to view the contents.
 * @type boolean
 * @on Use
 * @off Do not use
 * @default true
 *
 * @param useOutputPluginHeaders
 * @parent packaging
 * @text Use Plugin Header Output?
 * @desc Specify whether to output the plugin header/license information to a file. This can be used for copyright notation, etc.
 * @type boolean
 * @on Use
 * @off Do not use
 * @default false
 *
 * @param methods
 * @text ■ Feature Settings
 *
 * @param useAltF4FullScreen
 * @parent methods
 * @text Alt+Enter for Full Screen
 * @desc Should Alt+Enter toggle fullscreen?
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 *
 * @param useDeveloperToolsInDebugMode
 * @parent methods
 * @text Use Developer Tools in Debug Mode
 * @desc Should developer tools be used when launching in debug mode?
 * * This will be disabled in the built version.
 * @type boolean
 * @on Yes
 * @off No
 * @default false
 *
 * @command setSwitchIsSteam
 * @text Set Switch for Is Steam Build
 * @desc Reflects whether the current build is a Steam build to the specified switch.
 *
 * @arg switchId
 * @text Switch ID
 * @desc The ID of the switch to which whether it is a Steam build will be reflected.
 * @type switch
 *
 * @command activateAchievement
 * @text Activate Steam Achievement
 * @desc Activates the specified Steam achievement.
 * Does nothing in non-Steam environments.
 *
 * @arg achievementName
 * @text Achievement Name
 * @desc Specify the name of the achievement to be unlocked.
 * @type string
 *
 * @command openUrl
 * @text Open Specified URL
 * @desc Opens the specified URL in a browser.
 *
 * @arg url
 * @text URL
 * @desc Specify the URL to open.
 * @type string
 */

/*:ja
 * @target MZ
 * @plugindesc Steamテンプレート用プラグイン
 * @author Ruたん(ru_shalm)
 * @url https://github.com/rutan/steam-mz-template
 * @license MIT License
 * @base PluginCommonBase
 * @orderAfter PluginCommonBase
 * @help
 * Steamテンプレート用プラグインです。
 *
 * @param base
 * @text ■ 基本的な設定
 *
 * @param steamAppId
 * @parent base
 * @text Steam App ID
 * @desc このゲームの Steam 上での App ID を指定します。
 * @type number
 * @default 0
 *
 * @param packaging
 * @text ■ パッケージ設定
 *
 * @param packageName
 * @parent packaging
 * @text パッケージ名
 * @desc パッケージ化するときの名前を指定します。
 * （半角英数字のみを推奨）
 * @type string
 * @default my-game
 *
 * @param packageVersion
 * @parent packaging
 * @text バージョン情報
 * @desc パッケージ化するときのバージョン情報を指定します。
 * 例: 1.0.0
 * @type string
 * @default 1.0.0
 *
 * @param packageCopyright
 * @parent packaging
 * @text 著作情報
 * @desc パッケージ化するときの著作情報を指定します。
 * 例: (c) 2025 Ruたん
 * @type string
 * @default RPG Maker MZ
 *
 * @param useAsar
 * @parent packaging
 * @text ASAR アーカイブを利用するか
 * @desc ゲーム内容を ASAR アーカイブファイルにまとめて、中身を覗きづらくするかを指定します。
 * @type boolean
 * @on 利用する
 * @off 利用しない
 * @default true
 *
 * @param useOutputPluginHeaders
 * @parent packaging
 * @text プラグインヘッダー出力を利用するか
 * @desc プラグインのヘッダー/ライセンス情報をファイルに出力するかを指定します。著作表記などに利用できます。
 * @type boolean
 * @on 利用する
 * @off 利用しない
 * @default false
 *
 * @param methods
 * @text ■ 機能の設定
 *
 * @param useAltF4FullScreen
 * @parent methods
 * @text Alt+Enterでフルスクリーン
 * @desc Alt+Enter押下でフルスクリーンにするか？
 * @type boolean
 * @on する
 * @off しない
 * @default true
 *
 * @param useDeveloperToolsInDebugMode
 * @parent methods
 * @text デバッグ起動時に開発者ツールを使用
 * @desc デバッグ起動時に開発者ツールを使用するか？
 * ※ビルド版では無効になります。
 * @type boolean
 * @on する
 * @off しない
 * @default false
 *
 * @command setSwitchIsSteam
 * @text Steamビルドであるかをスイッチに設定
 * @desc 現在Steamビルドで動いているかを指定のスイッチに反映します。
 *
 * @arg switchId
 * @text スイッチのID
 * @desc Steamビルドであるかを反映するスイッチのID。
 * @type switch
 *
 * @command activateAchievement
 * @text Steam実績を達成
 * @desc 指定したSteam実績を達成します。
 * Steam以外の環境では何もしません。
 *
 * @arg achievementName
 * @text 実績名
 * @desc 達成する実績の名前を指定します
 * @type string
 *
 * @command openUrl
 * @text 指定URLを開く
 * @desc 指定したURLをブラウザで開きます。
 *
 * @arg url
 * @text URL
 * @desc 開くURLを指定します
 * @type string
 */

(() => {
  "use strict";

  const steam = window.steam;
  const parameter = PluginManagerEx.createParameter(document.currentScript);

  // ---------------------------------------------------------------------------
  // Utils

  /**
   * Steam向けビルドであるか？
   * @returns {boolean}
   */
  Utils.isSteam = function () {
    return !!steam;
  };

  // ---------------------------------------------------------------------------
  // Graphics

  const upstream_Graphics__defaultStretchMode = Graphics._defaultStretchMode;
  Graphics._defaultStretchMode = function () {
    // Steam実行時はデフォルトでウィンドウサイズにゲーム画面を合わせるようにする
    if (Utils.isSteam()) return true;

    return upstream_Graphics__defaultStretchMode.apply(this, arguments);
  };

  const upstream_Graphics__isFullScreen = Graphics._isFullScreen;
  Graphics._isFullScreen = function () {
    if (Utils.isSteam()) {
      return steam.isFullScreen();
    }
    return upstream_Graphics__isFullScreen.apply(this, arguments);
  };

  const upstream_Graphics__requestFullScreen = Graphics._requestFullScreen;
  Graphics._requestFullScreen = function () {
    if (Utils.isSteam()) {
      steam.setFullScreen(true);
      return;
    }
    return upstream_Graphics__requestFullScreen.apply(this, arguments);
  };

  const upstream_Graphics__cancelFullScreen = Graphics._cancelFullScreen;
  Graphics._cancelFullScreen = function () {
    if (Utils.isSteam()) {
      steam.setFullScreen(false);
      return;
    }
    return upstream_Graphics__cancelFullScreen.apply(this, arguments);
  };

  if (parameter.useAltF4FullScreen) {
    const upstream_Graphics__onKeyDown = Graphics._onKeyDown;
    Graphics._onKeyDown = function (event) {
      if (Utils.isSteam()) {
        // Alt + Enter
        if (!event.ctrlKey && event.altKey && event.keyCode === 13) {
          event.preventDefault();
          this._switchFullScreen();
          return;
        }
      }

      return upstream_Graphics__onKeyDown.apply(this, arguments);
    };
  }

  // ---------------------------------------------------------------------------
  // Input

  if (parameter.useAltF4FullScreen) {
    const upstream_Input__onKeyDown = Input._onKeyDown;
    Input._onKeyDown = function (event) {
      if (Utils.isSteam()) {
        // Alt + Enter
        if (!event.ctrlKey && event.altKey && event.keyCode === 13) {
          event.preventDefault();
          return;
        }
      }

      return upstream_Input__onKeyDown.apply(this, arguments);
    };
  }

  // ---------------------------------------------------------------------------
  // StorageManager

  /**
   * Steam向けのセーブデータ読み書きを行うか？
   * @returns {boolean}
   */
  StorageManager.isSteamMode = function () {
    return Utils.isSteam();
  };

  /**
   * Steam向けのセーブデータの保存
   * @param {string} saveName セーブファイル名
   * @param {string} zip セーブデータ
   * @returns {Promise<void>}
   */
  StorageManager.saveToSteamCloud = function (saveName, zip) {
    return steam.writeSaveData(this.steamCloudFileName(saveName), zip);
  };

  /**
   * Steam向けのセーブデータの読み込み
   * @param {string} saveName セーブファイル名
   * @returns {Promise<void>}
   */
  StorageManager.loadFromSteamCloud = function (saveName) {
    return steam.readSaveData(this.steamCloudFileName(saveName));
  };

  /**
   * Steam向けのセーブデータが存在するか？
   * @param {string} saveName セーブファイル名
   * @returns {Promise<boolean>}
   */
  StorageManager.steamCloudExists = function (saveName) {
    return steam.existsSaveData(this.steamCloudFileName(saveName));
  };

  /**
   * Steam向けのセーブデータの削除
   * @param {string} saveName セーブファイル名
   * @returns {Promise<void>}
   */
  StorageManager.removeSteamCloud = function (saveName) {
    return steam.removeSaveData(this.steamCloudFileName(saveName));
  };

  /**
   * Steam向けのセーブデータのファイル名
   * @param {string} saveName セーブファイル名
   * @returns {string}
   */
  StorageManager.steamCloudFileName = function (saveName) {
    return `${saveName}.rmmzsave`;
  };

  const upstream_StorageManager_saveZip = StorageManager.saveZip;
  StorageManager.saveZip = function (saveName, zip) {
    if (this.isSteamMode()) {
      return this.saveToSteamCloud(saveName, zip);
    }
    return upstream_StorageManager_saveZip.apply(this, arguments);
  };

  const upstream_StorageManager_loadZip = StorageManager.loadZip;
  StorageManager.loadZip = function (saveName) {
    if (this.isSteamMode()) {
      return this.loadFromSteamCloud(saveName);
    }
    return upstream_StorageManager_loadZip.apply(this, arguments);
  };

  const upstream_StorageManager_exists = StorageManager.exists;
  StorageManager.exists = function (saveName) {
    if (this.isSteamMode()) {
      return this.steamCloudExists(saveName);
    }
    return upstream_StorageManager_exists.apply(this, arguments);
  };

  const upstream_StorageManager_remove = StorageManager.remove;
  StorageManager.remove = function (saveName) {
    if (this.isLocalMode()) {
      return this.removeSteamCloud(saveName);
    }
    return upstream_StorageManager_remove.apply(this, arguments);
  };

  // ---------------------------------------------------------------------------
  // SceneManager

  const upstream_SceneManager_terminate = SceneManager.terminate;
  SceneManager.terminate = function () {
    if (Utils.isSteam()) {
      steam.exitApp();
      return;
    }
    upstream_SceneManager_terminate.apply(this, arguments);
  };

  // ---------------------------------------------------------------------------
  // PluginCommand

  PluginManagerEx.registerCommand(
    document.currentScript,
    "setSwitchIsSteam",
    (args) => {
      const switchId = Number(args.switchId);
      if (switchId > 0) {
        $gameSwitches.setValue(switchId, Utils.isSteam());
      }
    },
  );

  PluginManagerEx.registerCommand(
    document.currentScript,
    "activateAchievement",
    (args) => {
      const achievementName = String(args.achievementName).trim();

      if (Utils.isOptionValid("test")) {
        console.log(`[Steam] Activate Achievement: ${achievementName}`);
      }

      if (achievementName && Utils.isSteam()) {
        steam.activateAchievement(achievementName);
      }
    },
  );

  PluginManagerEx.registerCommand(document.currentScript, "openUrl", (args) => {
    const url = String(args.url).trim();

    if (Utils.isSteam()) {
      steam.openUrl(url);
    } else if (Utils.isNwjs()) {
      const nw = require("nw.gui");
      nw.Shell.openExternal(url);
    } else {
      window.open(url);
    }
  });
})();
