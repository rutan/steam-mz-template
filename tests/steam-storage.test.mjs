import assert from "node:assert/strict";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { createRuntime, loadPlugin } from "./helpers/runtime.mjs";

for (const mode of ["browser", "NW.js"]) {
  test(`${mode} storage delegates to the original methods unchanged`, () => {
    const { StorageManager: storage, upstreamCalls } = loadPlugin(undefined, mode === "NW.js");
    assert.equal(storage.isSteamMode(), false);
    assert.equal(storage.saveZip("file1", "zip"), "upstream:saveZip");
    assert.equal(storage.loadZip("file1"), "upstream:loadZip");
    assert.equal(storage.exists("file1"), "upstream:exists");
    assert.equal(storage.remove("file1"), "upstream:remove");
    assert.deepEqual(
      upstreamCalls.map(({ name, args }) => ({ name, args })),
      [
        { name: "saveZip", args: ["file1", "zip"] },
        { name: "loadZip", args: ["file1"] },
        { name: "exists", args: ["file1"] },
        { name: "remove", args: ["file1"] },
      ],
    );
    assert.ok(upstreamCalls.every(({ receiver }) => receiver === storage));
  });
}

test("Steam storage routes through IPC even though isLocalMode is false", async (t) => {
  const { StorageManager: storage, store, steam, upstreamCalls, ipcCalls } = await createRuntime(t);
  assert.equal(storage.isLocalMode(), false);
  assert.equal(storage.isSteamMode(), true);
  assert.equal(storage.exists("file1"), false);
  assert.equal(typeof storage.exists("file1"), "boolean");
  await storage.saveZip("file1", "save data");
  assert.equal(await store.read("file1.rmmzsave"), "save data");
  assert.equal(await storage.loadZip("file1"), "save data");
  assert.equal(storage.exists("file1"), true);
  assert.equal(storage.steamCloudExists("file1"), true);

  const asyncExists = steam.existsSaveData("file1.rmmzsave");
  assert.equal(typeof asyncExists.then, "function");
  assert.equal(await asyncExists, true);
  await storage.remove("file1");
  assert.equal(storage.exists("file1"), false);
  assert.equal(await storage.loadZip("file1"), null);
  assert.equal(await store.read("file1.rmmzsave"), null);
  assert.equal(await steam.existsSaveData("file1.rmmzsave"), false);
  await storage.remove("file1");
  assert.equal(upstreamCalls.length, 0);
  assert.ok(ipcCalls.some(({ channel }) => channel === "removeSaveData"));
  assert.ok(
    ipcCalls.some(({ kind, channel }) => kind === "sync" && channel === "existsSaveDataSync"),
  );
});

test("exists is accurate at startup, after direct bridge writes, and after external deletion", async (t) => {
  const { steam, store } = await createRuntime(t);
  await store.write("file1.rmmzsave", "existing save");
  const firstSession = loadPlugin(steam).StorageManager;
  assert.equal(firstSession.exists("file1"), true);
  assert.equal(firstSession.exists("missing"), false);
  await steam.writeSaveData("file2.rmmzsave", "bridge save");
  assert.equal(firstSession.exists("file2"), true);
  await rm(join(store.directory, "file1.rmmzsave"));
  assert.equal(firstSession.exists("file1"), false);
  const restartedSession = loadPlugin(steam).StorageManager;
  assert.equal(restartedSession.exists("file1"), false);
  assert.equal(restartedSession.exists("file2"), true);
});

function removeInvalidMetadata(storage, globalInfo) {
  // MZ's cleanup is synchronous: a Promise here would always be truthy.
  for (const id of Object.keys(globalInfo)) {
    if (!storage.exists(`file${id}`)) delete globalInfo[id];
  }
}

function requestDelete(storage, globalInfo, id) {
  // SaveCommand2 waits for removal, then invokes MZ's synchronous metadata cleanup.
  return Promise.resolve(storage.remove(`file${id}`)).then(() => {
    removeInvalidMetadata(storage, globalInfo);
  });
}

test("SaveCommand2-style deletion clears slot metadata and stays deleted after restart", async (t) => {
  const { StorageManager: storage, store, steam } = await createRuntime(t);
  const globalInfo = [{ title: "autosave" }, { title: "slot one" }, { title: "slot two" }];
  for (let id = 0; id < 3; id++) await storage.saveZip(`file${id}`, `save ${id}`);
  await storage.saveZip("global", JSON.stringify(globalInfo));
  await requestDelete(storage, globalInfo, 1);
  assert.equal(1 in globalInfo, false);
  assert.equal(globalInfo[0].title, "autosave");
  assert.equal(globalInfo[2].title, "slot two");
  assert.equal(await store.read("file1.rmmzsave"), null);

  // SaveCommand2 does not persist global info itself; startup cleanup must remove
  // the stale entry from disk without erasing the other slots.
  const restartedStorage = loadPlugin(steam).StorageManager;
  const reloadedInfo = JSON.parse(await restartedStorage.loadZip("global"));
  assert.equal(reloadedInfo[1].title, "slot one");
  removeInvalidMetadata(restartedStorage, reloadedInfo);
  assert.equal(1 in reloadedInfo, false);
  assert.equal(reloadedInfo[0].title, "autosave");
  assert.equal(reloadedInfo[2].title, "slot two");
  await requestDelete(restartedStorage, reloadedInfo, 0);
  assert.equal(0 in reloadedInfo, false);
  await requestDelete(restartedStorage, reloadedInfo, 0);
});

test("delete failures reject before metadata cleanup and preserve valid slots", async (t) => {
  const { StorageManager: storage, store } = await createRuntime(t);
  await mkdir(join(store.directory, "file1.rmmzsave"), { recursive: true });
  await storage.saveZip("file2", "valid save");
  const globalInfo = [null, { title: "slot one" }, { title: "slot two" }];
  await assert.rejects(requestDelete(storage, globalInfo, 1), /EISDIR|EPERM|EACCES/);
  assert.equal(globalInfo[1].title, "slot one");
  assert.equal(globalInfo[2].title, "slot two");
  assert.equal(await storage.loadZip("file2"), "valid save");
});

test("sync IPC returns storage errors to the renderer rather than reporting missing", async (t) => {
  const { StorageManager: storage, steam, directory } = await createRuntime(t);
  // A regular file in place of the save directory causes ENOTDIR on all checks.
  await writeFile(join(directory, "save"), "not a directory");
  assert.throws(() => storage.exists("file1"), { code: "ENOTDIR" });
  assert.throws(() => steam.existsSaveDataSync("file1.rmmzsave"), { code: "ENOTDIR" });
  await assert.rejects(steam.existsSaveData("file1.rmmzsave"), /ENOTDIR/);
  await assert.rejects(storage.remove("file1"), /ENOTDIR/);
});

test("sync IPC also replies when a malformed request fails validation", async (t) => {
  const { steam, ipcMain } = await createRuntime(t);
  for (const args of [undefined, null, {}]) {
    const event = {};
    ipcMain.listeners.get("existsSaveDataSync")(event, args);
    assert.equal(typeof event.returnValue.error.message, "string");
  }
  assert.throws(() => steam.existsSaveDataSync(undefined), { code: "ERR_INVALID_ARG_TYPE" });
});
