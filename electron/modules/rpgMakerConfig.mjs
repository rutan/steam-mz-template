import { readFile } from "node:fs/promises";

export async function readRpgMakerPluginConfigAll(pluginsJsPath) {
  const pluginsJs = await readFile(pluginsJsPath, "utf8");
  return JSON.parse(
    `[${pluginsJs
      .split(/\r?\n/)
      .filter((line) => line.startsWith("{"))
      .join("")}]`
  );
}

export async function readRpgMakerPluginConfig(pluginsJsPath, pluginName) {
  const plugins = await readRpgMakerPluginConfigAll(pluginsJsPath);
  return plugins.find((plugin) => plugin.name === pluginName);
}
