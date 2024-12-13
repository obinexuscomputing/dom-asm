#!/usr/bin/env node

const minimist = require('minimist');
const chalk = require('chalk');

const args = minimist(process.argv.slice(2));
console.log(chalk.green("dom-asm CLI running with args:"), args);
