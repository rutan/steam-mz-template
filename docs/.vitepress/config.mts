import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "RPGツクールMZ Steamテンプレート",
  description: "RPGツクールMZのSteam向けプロジェクトのテンプレート。",
  lastUpdated: true,
  themeConfig: {
    siteTitle: "MZ Steamテンプレート",
    search: {
      provider: "local",
    },

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "ガイド", link: "/guide/" },
      { text: "リファレンス", link: "/reference/" },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "概要",
          items: [{ text: "はじめに", link: "/guide/" }],
        },
        {
          text: "利用方法",
          items: [
            { text: "事前準備", link: "/guide/setup" },
            { text: "ダウンロード", link: "/guide/download" },
            { text: "プラグインの導入", link: "/guide/plugin" },
            { text: "ゲームのパッケージ化", link: "/guide/package" },
            { text: "Steamクラウドへの対応", link: "/guide/steam-cloud" },
          ],
        },
      ],
      "/reference/": [
        {
          text: "リファレンス",
          items: [{ text: "トップ", link: "/reference/" }],
        },
        {
          text: "プラグイン",
          items: [
            {
              text: "SteamPlugin.js",
              base: "/reference/steam-plugin",
              items: [
                { text: "概要", link: "-about" },
                { text: "プラグインコマンド", link: "-commands" },
              ],
            },
          ],
        },
        {
          text: "テンプレート仕様",
          items: [{ text: "ブリッジAPI", link: "/reference/bridge-api" }],
        },
      ],
    },

    socialLinks: [{ icon: "github", link: "https://github.com/rutan/steam-mz-template" }],
  },
  locales: {
    root: {
      label: "日本語",
      lang: "ja",
    },
    // en: {
    //   label: 'English',
    //   lang: 'er',
    //   title: "RPG Maker MZ Steam Template",
    // }
  },
});
