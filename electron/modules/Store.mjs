import { access, mkdir, rename, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * RPGツクール用のセーブデータの読み書き
 */
export class Store {
  constructor(directory) {
    this.directory = directory;
  }

  /**
   * セーブデータの読み込み
   * @param {string} saveName
   * @returns
   */
  async read(saveName) {
    const filePath = join(this.directory, saveName);
    try {
      const resp = await readFile(filePath, { encoding: "utf-8" });
      return resp;
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
      return null;
    }
  }

  /**
   * セーブデータの書き込み
   * @param {string} saveName
   * @param {string} data
   */
  async write(saveName, data) {
    await this.createDirectoryIfNotExists();
    const filePath = join(this.directory, saveName);
    const tmpFilePath = join(this.directory, `${saveName}.tmp`);
    try {
      await writeFile(tmpFilePath, data, { encoding: "utf-8" });
      await rename(tmpFilePath, filePath);
    } catch (e) {
      try {
        await unlink(tmpFilePath);
      } catch (_e) {
        // ignore
      }
      throw e;
    }
  }

  /**
   * セーブデータが存在するか確認
   * @param {string} saveName
   * @returns
   */
  async exists(saveName) {
    const filePath = join(this.directory, saveName);
    try {
      await access(filePath);
      return true;
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
      return false;
    }
  }

  /**
   * セーブデータの削除
   * @param {string} saveName
   */
  async remove(saveName) {
    const filePath = join(this.directory, saveName);
    try {
      await unlink(filePath);
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }
  }

  /**
   * セーブ用のフォルダが存在しない場合に作成
   */
  async createDirectoryIfNotExists() {
    try {
      await access(this.directory);
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
      await mkdir(this.directory, { recursive: true });
    }
  }
}
