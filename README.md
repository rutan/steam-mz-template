# RPG Maker MZ Template for Steam

- [更新履歴](./CHANGELOG.md)

## これはなに？

RPGツクールMZのSteam向けプロジェクトのテンプレートです。

RPGツクールMZで制作したゲームを Steam 向けにパッケージ化するためのアレコレが入っています。

## このテンプレートを使うために必要なもの

事前に以下をインストールする必要があります。

- [node.js](https://nodejs.org/)
  - v.20.11.0 以上が必要です
  - 古い場合は公式サイトの `Download Node.js (LTS)` から再度ダウンロードし、再インストールしてください

### 確認

コマンドプロンプトを起動し、以下のコマンドを実行してください。

```
node -v
```

`v■■.■■.■■` のようなバージョン名が表示されれば大丈夫です。

## 使い方（簡易版）

### (1) このテンプレートをコピーする

このテンプレート一式をダウンロードし、お好きな場所に配置してください。

### (2) 自分のゲームにプラグインとして `SteamPlugin.js` を追加する

テンプレートの `plugins` フォルダに入っている `SteamPlugin.js` を自分のゲームのプラグインとして追加してください。  
（Steam 起動時以外は特に何も起きないプラグインです）

追加後、プラグイン設定の中にある項目を設定してください。

#### 必須の項目
- Steam App ID
  - Steam のアプリケーション作成をした際に発行される数値です
  - 詳しくは [Steamworksの公式ドキュメント](https://partner.steamgames.com/doc/store/application?l=japanese) をご確認ください

### (3) テンプレートの `app` フォルダの中身を自分のゲームで置き換える

app フォルダの中身を自分のゲームプロジェクトに置き換えてください。

#### 未使用ファイルの削除や暗号化をしたい場合

ツクールMZのデプロイメントで「ウェブブラウザ」を選択してデプロイメントを行ってください。

その後、出力されたフォルダの中に入っているファイル一式を、テンプレートの `app` フォルダの中に移動してください。

### (4) テンプレートの `command.bat` を実行する

`command.bat` をダブルクリックして実行します。コマンドプロンプトが開き、選択肢が表示されます。

初回は `1` を選択してセットアップを実行してください。セットアップは何度実行しても大丈夫です。

ゲームを起動してみる場合は `2` 、ゲームを Steam 向けにビルドする場合は `3` を選択してください。

## パッケージ化した後の動作確認

パッケージ化したゲームは実行してもそのままでは起動しません。起動させるには以下のどちらかをする必要があります。

- 実際に Steam にアップロードし、Steam クライアント経由で起動する
- パッケージ化して出力されたゲームのフォルダに `steam_appid.txt` というファイルを作成する
  - 中身には Steam App ID を記載してください
  - **ただし、このファイルは Steam にアップロードする前にかならず削除してください**
  - 詳しくは [SteamWorksの公式ドキュメントの『初期化とシャットダウン』](https://partner.steamgames.com/doc/sdk/api?l=japanese#SteamAPI_Init) をご確認ください

## アイコンについて

実行ファイルのアイコンは自動的にゲーム内の `icon/icon.png` から生成を行います。

実行ファイル用に特殊なアイコンを設定したい場合は、ゲーム内の `icon` フォルダにご自身で作成した `icon.ico` ファイルを設置してください。

なお、Windows のアイコンキャッシュ機能により、設定を変更しても反映されてないように見える場合があります。時間が経てば反映されますが、即座に反映させたい場合は、Windowsのアイコンキャッシュの削除を行ってください。

## ライセンス

- Steam向けプロジェクトのテンプレート自体は MIT License です
- ゲームはそれぞれの作者のものです
