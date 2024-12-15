import { Command } from "commander";
import path from "path";
import fs from "fs";

// Import specialized packages
import {
  Tokenizer as CSSTokenizer,
  Parser as CSSParser,
  Validator as CSSValidator,
  ASTOptimizer as CSSOptimizer,
  Generator as CSSGenerator,
} from "@obinexuscomputing/css";

import {
  Tokenizer as HTMLTokenizer,
  Parser as HTMLParser,
  Validator as HTMLValidator,
  ASTOptimizer as HTMLOptimizer,
  Generator as HTMLGenerator,
} from "@obinexuscomputing/html";

import {
  Tokenizer as JSTokenizer,
  JSASTBuilder,
  JSParser,
  ASTOptimizer as JSOptimizer,
  Generator as JSGenerator,
} from "@obinexuscomputing/js";

const program = new Command();

// Validation helpers
function validateFile(filePath: string): string {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return absolutePath;
}

interface ProcessOptions {
  optimize?: boolean;
  validate?: boolean;
  format?: "json" | "text";
  output?: string;
  debug?: boolean;
}

// Generic file processing function
async function processFile(
  file: string,
  type: "css" | "html" | "js",
  options: ProcessOptions
) {
  const filePath = validateFile(file);
  const content = fs.readFileSync(filePath, "utf-8");

  let result: any = {};
  let tokens: any, ast: any;

  try {
    switch (type) {
      case "css":
        tokens = new CSSTokenizer().tokenize(content);
        ast = new CSSParser().parse(tokens);

        if (options.validate) {
          new CSSValidator(ast).validate();
        }

        if (options.optimize) {
          const optimizedAst = new CSSOptimizer(ast).optimize();
          result.optimized = new CSSGenerator().generate(optimizedAst);
        }
        break;

      case "html":
        tokens = new HTMLTokenizer().tokenize(content);
        ast = new HTMLParser().parse(tokens);

        if (options.validate) {
          new HTMLValidator(ast).validate();
        }

        if (options.optimize) {
          const optimizedAst = new HTMLOptimizer(ast).optimize();
          result.optimized = new HTMLGenerator().generate(optimizedAst);
        }
        break;

      case "js":
        tokens = new JSTokenizer().tokenize(content);
        ast = new JSASTBuilder(tokens).buildAST();

        if (options.validate) {
          console.warn("[Validation] Not implemented for JS.");
        }

        if (options.optimize) {
          const optimizedAst = new JSOptimizer(ast).optimize();
          result.optimized = new JSGenerator().generate(optimizedAst);
        }
        break;
    }

    result.tokens = tokens;
    result.ast = ast;

    if (options.debug) {
      console.debug(`[DEBUG] Tokens: ${JSON.stringify(tokens, null, 2)}`);
      console.debug(`[DEBUG] AST: ${JSON.stringify(ast, null, 2)}`);
    }

    const output =
      options.format === "text"
        ? JSON.stringify(result, null, 2)
        : result;

    if (options.output) {
      fs.writeFileSync(
        options.output,
        typeof output === "string" ? output : JSON.stringify(output, null, 2)
      );
    } else {
      console.log(output);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[Error] ${error.message}`);
    } else {
      console.error("[Error] Unknown error occurred");
    }
    throw error;
  }
}

// Command registration function
const registerCommand = (type: "css" | "html" | "js", description: string) => {
  const cmd = program.command(type).description(`${description} processing commands`);
  cmd
    .command("parse")
    .argument("<file>", `${description} file to parse`)
    .description(`Parse a ${description} file`)
    .option("-o, --optimize", "Optimize the AST")
    .option("-v, --validate", "Validate the AST")
    .option("-f, --format <format>", "Output format (json or text)", "json")
    .option("--output <file>", "Output file (defaults to stdout)")
    .option("-d, --debug", "Enable debug output")
    .action((file, options) => {
      processFile(file, type, options).catch((error) => {
        console.error("Error:", error.message);
        process.exit(1);
      });
    });
};

// Register commands for CSS, HTML, and JavaScript
registerCommand("css", "CSS");
registerCommand("html", "HTML");
registerCommand("js", "JavaScript");

// CLI entry point
program
  .name("@obinexuscomputing/asm")
  .version("1.0.0")
  .description("DOM ASM CLI tool for parsing and analyzing web assets");

// Parse command-line arguments
program.parse(process.argv);
