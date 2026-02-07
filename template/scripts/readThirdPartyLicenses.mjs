import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import { init } from "license-checker-rseidelsohn";

export async function readThirdPartyLicenses() {
  const packageJson = JSON.parse(await readFile("./package.json", "utf-8"));
  const currentPackageNameAndVersion = `${packageJson.name}@${packageJson.version}`;

  const packages = await promisify(init)({
    start: "./",
    production: true,
  });

  const result = [];
  for (const [pkgName, pkgInfo] of Object.entries(packages)) {
    // 自パッケージは除外
    if (pkgName === currentPackageNameAndVersion) continue;

    const licenseText = pkgInfo.licenseFile
      ? await readFile(pkgInfo.licenseFile, "utf-8")
      : pkgInfo.licenseText ||
        (Array.isArray(pkgInfo.licenses) ? pkgInfo.licenses.join("/") : pkgInfo.licenses);

    result.push([`# ${pkgName}`, licenseText].join("\n"));
  }

  return result.join("\n====================\n\n");
}
