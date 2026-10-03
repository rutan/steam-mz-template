import assert from "node:assert/strict";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { runInNewContext } from "node:vm";
import { Store } from "../../template/electron/modules/Store.mjs";

const root = new URL("../../", import.meta.url);
const pluginSource = await readFile(new URL("template/plugins/SteamPlugin.js", root), "utf8");
const preloadSource = await readFile(new URL("template/electron/preload.cjs", root), "utf8");

export function loadPlugin(steam, isLocalMode = false) {
  const upstreamCalls = [];
  const StorageManager = { isLocalMode: () => isLocalMode };
  for (const name of ["saveZip", "loadZip", "exists", "remove"]) {
    StorageManager[name] = function (...args) {
      upstreamCalls.push({ name, args, receiver: this });
      return `upstream:${name}`;
    };
  }
  runInNewContext(pluginSource, {
    window: { steam },
    document: { currentScript: {} },
    PluginManagerEx: { createParameter: () => ({}), registerCommand() {} },
    Utils: {},
    Graphics: {},
    Input: {},
    StorageManager,
    SceneManager: {},
  });
  return { StorageManager, upstreamCalls };
}

export async function createRuntime(t) {
  const directory = await mkdtemp(join(tmpdir(), "steam-mz-runtime-"));
  t.after(() => rm(directory, { recursive: true, force: true }));

  // Load unchanged production bridge modules against a minimal Electron test double.
  const electronPath = join(directory, "node_modules", "electron");
  await mkdir(electronPath, { recursive: true });
  await writeFile(
    join(electronPath, "package.json"),
    JSON.stringify({ type: "module", exports: "./index.mjs" }),
  );
  await writeFile(
    join(electronPath, "index.mjs"),
    `export const app = { getPath: () => ${JSON.stringify(join(directory, "game"))} };
     export const shell = { openExternal() {} };
     export const ipcMain = {
       handlers: new Map(), listeners: new Map(),
       handle(name, handler) { this.handlers.set(name, handler); },
       on(name, handler) { this.listeners.set(name, handler); }
     };`,
  );
  for (const name of ["bridge.mjs", "Store.mjs"]) {
    await copyFile(new URL(`template/electron/modules/${name}`, root), join(directory, name));
  }
  const { registerBridge } = await import(pathToFileURL(join(directory, "bridge.mjs")));
  const { ipcMain } = await import(pathToFileURL(join(electronPath, "index.mjs")));
  await registerBridge({
    browserWindow: { webContents: { setWindowOpenHandler() {} }, on() {} },
    steamApi: { client: { localplayer: { getSteamId: () => ({ steamId64: "12345" }) } } },
  });

  let steam;
  const ipcCalls = [];
  const ipcRenderer = {
    invoke(channel, args) {
      ipcCalls.push({ kind: "async", channel, args });
      return Promise.resolve()
        .then(() => ipcMain.handlers.get(channel)({}, args))
        .catch((error) => {
          // Electron invoke errors preserve the message, not custom Error fields.
          throw new Error(error.message);
        });
    },
    sendSync(channel, args) {
      ipcCalls.push({ kind: "sync", channel, args });
      const event = {};
      ipcMain.listeners.get(channel)(event, args);
      assert.ok(Object.hasOwn(event, "returnValue"), "sync IPC must always reply");
      return event.returnValue;
    },
    addListener() {},
  };
  runInNewContext(preloadSource, {
    require(name) {
      assert.equal(name, "electron");
      return {
        contextBridge: {
          exposeInMainWorld(name, api) {
            assert.equal(name, "steam");
            steam = api;
          },
        },
        ipcRenderer,
      };
    },
  });
  const store = new Store(join(directory, "save", "12345"));
  return { ...loadPlugin(steam), steam, store, ipcMain, ipcCalls, directory };
}
