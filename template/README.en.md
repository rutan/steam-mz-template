# RPG Maker MZ Template for Steam

- Japanese: [README.md](./README.md)

## Requirements

- [Node.js](https://nodejs.org/)
  - v22.0.0 or later

### Check version

Open Command Prompt and run:

```txt
node -v
```

If you see something like `v22.x.x`, you are good to go.

## Quick start

### (1) Copy this template

Download this repository and place it anywhere on your PC.

### (2) Add `SteamPlugin.js` to your game

Copy `plugins/SteamPlugin.js` into your game project and add it as a plugin.
Then set the plugin parameters.

Required parameter:

- Steam App ID
  - The numeric ID assigned when you create your Steam app
  - See the [Steamworks docs](https://partner.steamgames.com/doc/store/application?l=english)

### (3) Replace the `app` folder contents

Replace the contents of `app` with your RPG Maker MZ game files.

If you want to remove unused files or encrypt content, deploy your game with the
"Web Browser" target and copy that output into `app`.

### (4) Run the build command

Run `command_en.bat`. The menu options are:

- `1`: Setup (`npm install`)
- `2`: Run game (`npm run dev`)
- `3`: Build for Steam (`npm run package`)

## After packaging

Packaged games will not run directly unless Steam is active or you create
`steam_appid.txt` in the packaged game folder and add your App ID.

Important: remove `steam_appid.txt` before uploading to Steam.
See the [Steamworks docs](https://partner.steamgames.com/doc/sdk/api?l=english#SteamAPI_Init).

## Icons

The executable icon is generated from `icon/icon.png` by default.
If you want a custom icon, add `icon/icon.ico` in your game project.
