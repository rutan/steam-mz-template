# ブリッジAPI

RPGツクールMZのSteamテンプレートには、ElectronとRPGツクールMZの間を橋渡しするためのブリッジAPIが含まれています。このAPIを使用することで、ゲーム内からSteamの各種機能にアクセスできます。

基本的には `SteamPlugin.js` プラグインを通じて利用されるため、直接このAPIを使用する必要はありません。ただし、独自のプラグインやスクリプトから機能を利用したい場合に、このブリッジAPIを活用できます。

ブリッジAPIは `window.steam` オブジェクトを通じてアクセスできます。

実装の詳細は [preload.cjs](https://github.com/rutan/steam-mz-template/blob/main/template/electron/preload.cjs) から確認できます。

## `window.steam.exitApp(): Promise<void>`

ゲームを終了します。

## `window.steam.openUrl(url: string): Promise<void>`

指定したURLを既定のウェブブラウザで開きます。

## `window.steam.readSaveData(saveName: string): Promise<string | null>`

指定した名前のセーブデータを読み込みます。セーブデータが存在しない場合は `null` を返します。

セーブデータ名はファイル名に使用できる文字列である必要があります。

## `window.steam.writeSaveData(saveName: string, data: string): Promise<void>`

指定した名前でセーブデータを書き込みます。

セーブデータ名はファイル名に使用できる文字列である必要があります。

## `window.steam.existsSaveData(saveName: string): Promise<boolean>`

指定した名前のセーブデータが存在するかどうかを確認します。

## `window.steam.removeSaveData(saveName: string): Promise<void>`

指定した名前のセーブデータを削除します。

## `window.steam.isFullScreen(): boolean`

ゲームがフルスクリーンモードかどうかを返します。

このメソッドは同期的に動作します。

## `window.steam.setFullScreen(isFullscreen: boolean): Promise<void>`

ゲームのフルスクリーンモードを設定します。

`isFullscreen` に `true` を指定するとフルスクリーンモードに、`false` を指定するとウィンドウモードになります。

## `window.steam.isActivatedAchievement(achievementName: string): Promise<boolean>`

指定した名前の実績が既に達成されているかどうかを返します。

## `window.steam.activateAchievement(achievementName: string): Promise<void>`

指定した名前の実績を達成します。

## `window.steam.deactivateAchievement(achievementName: string): Promise<void>`

指定した名前の実績を未達成にします。
