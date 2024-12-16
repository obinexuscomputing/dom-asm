import { Command } from "commander";
import path from "path";
import fs from "fs";

import {
  CSSTokenizer,
  CSSParser,
  CSSValidator,
  CSSASTOptimizer,
  CSSCodeGenerator,
} from "@obinexuscomputing/css";

import {
  HTMLTokenizer,
  HTMLParser,
  HTMLValidator,
  HTMLASTOptimizer,
  HTMLCodeGenerator,
} from "@obinexuscomputing/html";

import {
  JSTokenizer,
  JSASTBuilder,
  JSValidator,
  JSASTOptimizer,
  JSCodeGenerator,
} from "@obinexuscomputing/js";

import {
  DOMXMLTokenizer,
  DOMXMLParser,
  DOMXMLValidator,
  DOMXMLASTOptimizer,
  DOMXMLGenerator,
} from "@obinexuscomputing/xml";

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

// Unified file processing function
async function processFile(
  file: string,
  type: "css" | "html" | "js" | "xml" | "asm",
  options: ProcessOptions,
) {
  const filePath = validateFile(file);
  const content = fs.readFileSync(filePath, "utf-8");

  const result: any = {};
  let tokens: any, ast: any;

  try {
    switch (type) {
      case "css":
        tokens = new CSSTokenizer(content).tokenize();
        ast = new CSSParser(tokens).parse();
        if (options.validate) {
          const validator = new CSSValidator(ast);
          const validationErrors = validator.validate();
          if (validationErrors.length > 0) {
            throw new Error(
              `Validation errors:\n${validationErrors.join("\n")}`,
            );
          }
        }
        if (options.optimize) {
          const optimizer = new CSSASTOptimizer(ast);
          ast = optimizer.optimize();
          const generator = new CSSCodeGenerator(ast);
          result.optimized = generator.generate();
        }
        break;

      case "html":
        tokens = new HTMLTokenizer(content).tokenize();
        ast = new HTMLParser().parse(tokens);
        if (options.validate) {
          const validator = new HTMLValidator();
          const validationResult = validator.validate(ast);
          if (!validationResult.valid) {
            throw new Error(
              `Validation errors:\n${validationResult.errors.join("\n")}`,
            );
          }
        }
        if (options.optimize) {
          const optimizer = new HTMLASTOptimizer();
          ast = optimizer.optimize(ast);
          const generator = new HTMLCodeGenerator();
          result.optimized = generator.generateHTML(ast);
        }
        break;

      case "js":
        tokens = new JSTokenizer().tokenize(content);
        ast = new JSASTBuilder(tokens).buildAST();
        if (options.validate) {
          const validator = new JSValidator();
          const validationErrors = validator.validate(ast);
          if (validationErrors.length > 0) {
            throw new Error(
              `Validation errors:\n${validationErrors.join("\n")}`,
            );
          }
        }
        if (options.optimize) {
          const optimizer = new JSASTOptimizer();
          ast = optimizer.optimize(ast);
          const generator = new JSCodeGenerator();
          result.optimized = generator.generate(ast);
        }
        break;

      case "xml":
        tokens = new DOMXMLTokenizer(content).tokenize();
        ast = new DOMXMLParser(tokens).parse();
        if (options.validate) {
          const validator = new DOMXMLValidator();
          const validationResult = validator.validate(ast);
          if (!validationResult.valid) {
            throw new Error(
              `Validation errors:\n${validationResult.errors
                .map((e) => `${e.code}: ${e.message}`)
                .join("\n")}`,
            );
          }
        }
        if (options.optimize) {
          const optimizer = new DOMXMLASTOptimizer();
          ast = optimizer.optimize(ast);
          const generator = new DOMXMLGenerator();
          result.optimized = generator.generate(ast);
        }
        break;

      case "asm":
        // Placeholder for ASM processing logic
        throw new Error("ASM processing is not implemented yet.");
    }

    result.tokens = tokens;
    result.ast = ast;

    if (options.debug) {
      console.debug(`[DEBUG] Tokens: ${JSON.stringify(tokens, null, 2)}`);
      console.debug(`[DEBUG] AST: ${JSON.stringify(ast, null, 2)}`);
    }

    const output =
      options.format === "text" ? JSON.stringify(result, null, 2) : result;

    if (options.output) {
      fs.writeFileSync(
        options.output,
        typeof output === "string" ? output : JSON.stringify(output, null, 2),
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
const registerCommand = (
  type: "css" | "html" | "js" | "xml" | "asm",
  description: string,
) => {
  const cmd = program
    .command(type)
    .description(`${description} processing commands`);
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

// Register commands for each type
registerCommand("css", "CSS");
registerCommand("html", "HTML");
registerCommand("js", "JavaScript");
registerCommand("xml", "XML");
registerCommand("asm", "ASM");

// CLI entry point
program
  .name("@obinexuscomputing/dom-asm")
  .version("1.0.0")
  .description("DOM ASM CLI tool for parsing and analyzing web assets");

// Parse command-line arguments
program.parse(process.argv);
