#! /usr/bin/env node

const process = require("process");
const packageJson = require("./package.json");
const {
  isRoot,
  getPackageJson,
  updatePackageJson,
  writeFile,
  generatePostInstallScript,
} = require("./utils");
const { execSync } = require("child_process");

console.log(`ng-tailwindcss-jit v${packageJson.version}`);

if (!isRoot()) {
  console.warn("Not running at project root");
  process.exit();
}

const pkg = getPackageJson();
const installedPackages = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
];

// if (!installedPackages.includes("@angular/core")) {
//   console.warn("Not an angular project");
//   process.exit();
// }

// if (!installedPackages.includes("tailwindcss")) {
//   console.warn("Tailwind is not installed");
//   process.exit();
// }

// if (!pkg.scripts.start) {
//   console.warn("Start command not found");
//   process.exit();
// }

pkg.scripts.start = `TAILWIND_MODE='watch' ${pkg.scripts.start}`;
pkg.scripts.postinstall = pkg.scripts.postinstall
  ? `node ./scripts/ng-tailwindcss-jit.js && ${pkg.scripts.postinstall}`
  : `node ./scripts/ng-tailwindcss-jit.js`;

writeFile("./scripts/ng-tailwindcss-jit.js", generatePostInstallScript());

updatePackageJson(pkg);

console.log("Installing @tailwindcss/jit");

try {
  execSync("node ./scripts/ng-tailwindcss-jit.js && npm i @tailwindcss/jit --save-dev");
} catch {
  console.log("Installation of @tailwindcss/jit failed");
  process.exit();
}

console.log("Configured successfully");
