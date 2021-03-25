#! /usr/bin/env node

const process = require("process");
const packageJson = require("./package.json");
const { execSync } = require("child_process");
const {
  isRoot,
  isAlreadyConfigured,
  getPackageJson,
  updatePackageJson,
  readModule,
  writeFile,
  generatePostInstallScript,
} = require("./utils");
const { logSuccess, logError, logWarning, log } = require("./logging");

console.log(`${packageJson.name} v${packageJson.version}`);

// VALIDATIONS
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

// START SCRIPT
log("Update start script in package.json");
const START_SCRIPT = "cross-env TAILWIND_MODE=watch";

let startScript = pkg.scripts.start;
startScript = startScript.replace("TAILWIND_MODE='watch' ", "");
if (!startScript.includes(START_SCRIPT)) {
  startScript = startScript.replace("ng serve", `${START_SCRIPT} ng serve`);
}
pkg.scripts.start = startScript;

// POST INSTALL SCRIPT
log("Add postinstall script in package.json");
const POSTINSTALL_SCRIPT = "node ./scripts/ng-tailwindcss-jit.js";

let postinstallScript = pkg.scripts.postinstall;
if (!postinstallScript) {
  pkg.scripts.postinstall = POSTINSTALL_SCRIPT;
} else if (!postinstallScript.includes(POSTINSTALL_SCRIPT)) {
  pkg.scripts.postinstall = `${POSTINSTALL_SCRIPT} && ${pkg.scripts.postinstall}`;
}

writeFile("./scripts/ng-tailwindcss-jit.js", generatePostInstallScript());

updatePackageJson(pkg);

// INSTALL PACKAGES
log("Installing required packages");

const tailwindJitPackageName = !installedPackages.includes("@tailwindcss/jit")
  ? "@tailwindcss/jit"
  : "";
try {
  execSync(`npm i --save-dev ${tailwindJitPackageName} cross-env`, {
    stdio: "inherit",
  });
  execSync("node ./scripts/ng-tailwindcss-jit.js", { stdio: "inherit" });
} catch {
  logError("Installation of @tailwindcss/jit failed");
  process.exit();
}

logSuccess("Configured @tailwind/jit successfully");

// FREQUENT ERRORS
try {
  const tailwindConfig = readModule("./tailwind.config.js");
  if (
    !tailwindConfig ||
    !tailwindConfig.purge ||
    tailwindConfig.purge.length === 0
  ) {
    logWarning(
      "Ensure that files to `purge` are configured in your tailwind config file"
    );
  }
} catch {}
