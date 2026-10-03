import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { Store } from "../template/electron/modules/Store.mjs";

async function createStore(t) {
  const directory = await mkdtemp(join(tmpdir(), "steam-mz-store-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return new Store(join(directory, "save"));
}

test("save data can be written, read, removed, and checked after reopening", async (t) => {
  const store = await createStore(t);
  const saveName = "file1.rmmzsave";
  assert.equal(await store.exists(saveName), false);
  assert.equal(store.existsSync(saveName), false);
  assert.equal(await store.read(saveName), null);
  await store.remove(saveName);

  await store.write(saveName, "first save");
  assert.equal(await store.exists(saveName), true);
  assert.equal(store.existsSync(saveName), true);
  assert.equal(await store.read(saveName), "first save");
  await store.write(saveName, "second save");
  assert.equal(await store.read(saveName), "second save");
  assert.equal(await new Store(store.directory).exists(saveName), true);

  await store.remove(saveName);
  assert.equal(await store.exists(saveName), false);
  assert.equal(store.existsSync(saveName), false);
  assert.equal(await store.read(saveName), null);
  assert.equal(await new Store(store.directory).exists(saveName), false);
  await assert.rejects(stat(join(store.directory, saveName)), { code: "ENOENT" });
  await store.remove(saveName);
});

test("removing one save leaves other saves and global metadata untouched", async (t) => {
  const store = await createStore(t);
  await store.write("file1.rmmzsave", "slot one");
  await store.write("file2.rmmzsave", "slot two");
  await store.write("global.rmmzsave", "global metadata");
  await store.remove("file1.rmmzsave");
  assert.equal(await store.read("file2.rmmzsave"), "slot two");
  assert.equal(await store.read("global.rmmzsave"), "global metadata");
});

test("removal rejects non-missing-file errors without deleting the target", async (t) => {
  const store = await createStore(t);
  const target = join(store.directory, "file1.rmmzsave");
  await mkdir(target, { recursive: true });
  await writeFile(join(target, "keep.txt"), "keep");
  await assert.rejects(store.remove("file1.rmmzsave"), (error) =>
    ["EISDIR", "EPERM", "EACCES"].includes(error.code),
  );
  assert.equal(await readFile(join(target, "keep.txt"), "utf8"), "keep");
});

test("a failed write removes its temporary file and preserves the original target", async (t) => {
  const store = await createStore(t);
  const target = join(store.directory, "file1.rmmzsave");
  await mkdir(target, { recursive: true });
  await writeFile(join(target, "keep.txt"), "keep");
  await assert.rejects(store.write("file1.rmmzsave", "new save"));
  await assert.rejects(stat(`${target}.tmp`), { code: "ENOENT" });
  assert.equal(await readFile(join(target, "keep.txt"), "utf8"), "keep");
});
