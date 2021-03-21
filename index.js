#! /usr/bin/env node

const process = require("process");
const packageJson = require("./package.json");
const { execSync } = require("child_process");
const ora = require("ora");
const {
  isRoot,
  isAlreadyConfigured,
  getPackageJson,
  updatePackageJson,
  writeFile,
  generatePostInstallScript,
} = require("./utils");
const { logSuccess, logError, logWarning } = require("./logging");

console.log(`${packageJson.name} v${packageJson.version}`);

if (!isRoot()) {
  logWarning("Not running at project root");
  process.exit();
}

if (isAlreadyConfigured()) {
  logWarning(`${packageJson.name} is already configured`);
  process.exit();
}

const pkg = getPackageJson();
const installedPackages = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
];

if (!installedPackages.includes("@angular/core")) {
  logWarning("Not an angular project");
  process.exit();
}

if (!installedPackages.includes("tailwindcss")) {
  logWarning("Tailwind is not installed");
  process.exit();
}

if (!pkg.scripts.start) {
  logWarning("Start command not found");
  process.exit();
}

pkg.scripts.start = `TAILWIND_MODE='watch' ${pkg.scripts.start}`;
pkg.scripts.postinstall = pkg.scripts.postinstall
  ? `node ./scripts/ng-tailwindcss-jit.js && ${pkg.scripts.postinstall}`
  : `node ./scripts/ng-tailwindcss-jit.js`;

writeFile("./scripts/ng-tailwindcss-jit.js", generatePostInstallScript());

updatePackageJson(pkg);

if (!installedPackages.includes("@tailwindcss/jit")) {
  const spinner = ora({
    text: "Installing @tailwindcss/jit\n",
    interval: 10,
  }).start();
  spinner.color = "green";

  try {
    execSync(
      "node ./scripts/ng-tailwindcss-jit.js && npm i @tailwindcss/jit --save-dev"
    );
  } catch {
    logError("Installation of @tailwindcss/jit failed");
    process.exit();
  }
  spinner.stop();
} else {
  execSync("node ./scripts/ng-tailwindcss-jit.js");
}

logSuccess("Configured successfully");
