import { Command } from "commander";
import * as CSS from "../api/css-api";
import * as HTML from "../api/html-api";
import * as JS from "../api/js-api";

const program = new Command();

// Version and description
program.version("1.0.0").description("CLI for @obinexuscomputing/asm");

// CSS Commands
program
  .command("css-parse <file>")
  .description("Parse a CSS file")
  .action((file) => {
    const parsed = CSS.parseFile(file);
    console.log(JSON.stringify(parsed, null, 2));
  });

// HTML Commands
program
  .command("html-parse <file>")
  .description("Parse an HTML file")
  .action((file) => {
    const parsed = HTML.parseFile(file);
    console.log(JSON.stringify(parsed, null, 2));
  });

// JS Commands
program
  .command("js-parse <file>")
  .description("Parse a JavaScript file")
  .action((file) => {
    const parsed = JS.parseFile(file);
    console.log(JSON.stringify(parsed, null, 2));
  });

// Execute the CLI
program.parse(process.argv);
