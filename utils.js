const path = require("path");
const {
  existsSync,
  readFileSync,
  ensureFileSync,
  outputFileSync,
} = require("fs-extra");

function isRoot() {
  const pkgPath = path.resolve("./package.json");

  return existsSync(pkgPath);
}

function isAlreadyConfigured() {
  const pkgPath = path.resolve("./scripts/ng-tailwindcss-jit.js");

  return existsSync(pkgPath);
}

function getPackageJson() {
  const pkgPath = path.resolve("./package.json");
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath));
    return pkg;
  }
  return false;
}

function updatePackageJson(content) {
  ensureFileSync("./package.json");

  return outputFileSync("./package.json", JSON.stringify(content, null, 2));
}

function writeFile(path, content) {
  ensureFileSync(path);

  return outputFileSync(path, content);
}

function generatePostInstallScript() {
  return `const fs = require("fs");
console.log('Running postinstall script')

const pathToStylesFile =
  "node_modules/@angular-devkit/build-angular/src/webpack/configs/styles.js";

try {
  let data = fs.readFileSync(pathToStylesFile, "utf-8");

  data = data.replace(/\'tailwindcss\'/g, "'@tailwindcss/jit'");
  fs.writeFileSync(pathToStylesFile, data);
} catch {
  console.log("Post-install error");
}
`;
}

module.exports = {
  isRoot,
  isAlreadyConfigured,
  getPackageJson,
  updatePackageJson,
  writeFile,
  generatePostInstallScript,
};
