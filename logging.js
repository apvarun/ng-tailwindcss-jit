const chalk = require("chalk");

function logError(message) {
  console.log(chalk.bgRed(message));
}

function logSuccess(message) {
  console.log(chalk.green(message));
}

function logWarning(message) {
  console.log(chalk.yellow(message));
}

function log(message) {
  console.log(message);
}

module.exports = {
  logError,
  logSuccess,
  logWarning,
  log,
};
