---
title: SteamPlugin.js のプラグインコマンド
---

# プラグインコマンド

`SteamPlugin.js` が提供するプラグインコマンドは以下の通りです。

## Steamビルドであるかをスイッチに設定

| 引数       | 説明                                        |
| ---------- | ------------------------------------------- |
| スイッチID | Steamビルドの場合にONにするスイッチIDを設定 |

現在実行中の環境がSteamテンプレートを利用してパッケージ化されたSteamビルドであるかを判定し、指定したスイッチをONにします。Steamビルドでない場合はスイッチをOFFにします。

PLiCyなどSteam以外の環境でも公開する場合に、Steamビルドかどうかで処理を分岐させたい場合に利用することを想定しています。

## Steam実績を達成

| 引数   | 説明                     |
| ------ | ------------------------ |
| 実績名 | 達成する実績の名前を設定 |

Steamの実績を達成します。引数に指定した名前の実績がSteamworks側で登録されている必要があります。

Steamの実績の詳細は [Steamworksのドキュメント](https://partner.steamgames.com/doc/features/achievements?l=japanese) を参照してください。

## 指定URLを開く

| 引数 | 説明          |
| ---- | ------------- |
| URL  | 開くURLを設定 |

指定したURLを既定のウェブブラウザで開きます。

このプラグインコマンドをSteamビルド以外の環境で実行した場合は、以下のような挙動をします。

- RPGツクールMZ標準のWindows / macOS向けビルドの場合: 指定したURLを既定のウェブブラウザで開きます
- ウェブブラウザ向けビルドの場合: `window.open` を利用して新しいタブでURLを開きます
  - <!-- textlint-disable ja-technical-writing -->ふりーむ！<!-- textlint-enable ja-technical-writing -->やPLiCyなどの公開サイトでは禁止（無効化）されている場合があります
