#!/usr/bin/env node

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
  JSAstMinimizer,
  JSAstGenerator, // Correct generator import
} from "@obinexuscomputing/js";

import {
  DOMXMLTokenizer,
  DOMXMLParser,
  DOMXMLValidator,
  DOMXMLASTOptimizer,
  DOMXMLGenerator,
} from "@obinexuscomputing/xml";

// Fetch package version dynamically
const packageJsonPath = path.resolve(__dirname, "../package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
const packageVersion = packageJson.version;

const program = new Command();

/**
 * Validate the existence of a file and return its absolute path.
 */
function validateFile(filePath: string): string {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return absolutePath;
}

/**
 * Unified file processing function for all supported file types.
 */
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
          const validationErrors = new CSSValidator(ast).validate();
          if (validationErrors.length) {
            throw new Error(validationErrors.join("\n"));
          }
        }
        if (options.optimize) {
          ast = new CSSASTOptimizer(ast).optimize();
          result.optimized = new CSSCodeGenerator(ast).generate();
        }
        break;

      case "html":
        tokens = new HTMLTokenizer(content).tokenize();
        ast = new HTMLParser().parse(tokens);
        if (options.validate) {
          const validationResult = new HTMLValidator().validate(ast);
          if (!validationResult.valid) {
            throw new Error(validationResult.errors.join("\n"));
          }
        }
        if (options.optimize) {
          ast = new HTMLASTOptimizer().optimize(ast);
          result.optimized = new HTMLCodeGenerator().generateHTML(ast);
        }
        break;

      case "js":
        tokens = new JSTokenizer().tokenize(content);
        ast = new JSASTBuilder(tokens).buildAST();
        if (options.validate) {
          const validationErrors = new JSValidator().validate(ast);
          if (validationErrors.length) {
            throw new Error(validationErrors.join("\n"));
          }
        }
        if (options.optimize) {
          ast = new JSAstMinimizer().optimize(ast);
          const generationResult = new JSAstGenerator().generateFromAST(ast);
          if (!generationResult.success) {
            throw new Error(
              generationResult.errors.map((e) => `${e.code}: ${e.message}`).join("\n"),
            );
          }
          result.optimized = generationResult.output;
        }
        break;

      case "xml":
        tokens = new DOMXMLTokenizer(content).tokenize();
        ast = new DOMXMLParser(tokens).parse();
        if (options.validate) {
          const validationResult = new DOMXMLValidator().validate(ast);
          if (!validationResult.valid) {
            throw new Error(
              validationResult.errors.map((e) => `${e.code}: ${e.message}`).join("\n"),
            );
          }
        }
        if (options.optimize) {
          ast = new DOMXMLASTOptimizer().optimize(ast);
          result.optimized = new DOMXMLGenerator().generate(ast);
        }
        break;

      case "asm":
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
    console.error(`[Error] ${error instanceof Error ? error.message : error}`);
    throw error;
  }
}

/**
 * Command registration helper.
 */
const registerCommand = (
  type: "css" | "html" | "js" | "xml" | "asm",
  description: string,
) => {
  program
    .command(type)
    .description(`${description} processing commands`)
    .command("parse")
    .argument("<file>", `${description} file to parse`)
    .option("-o, --optimize", "Optimize the AST")
    .option("-v, --validate", "Validate the AST")
    .option("-f, --format <format>", "Output format (json or text)", "json")
    .option("--output <file>", "Output file (defaults to stdout)")
    .option("-d, --debug", "Enable debug output")
    .action((file, options) => {
      processFile(file, type, options).catch(() => process.exit(1));
    });
};

// Register supported commands
registerCommand("css", "CSS");
registerCommand("html", "HTML");
registerCommand("js", "JavaScript");
registerCommand("xml", "XML");
registerCommand("asm", "ASM");

// CLI entry point
program
  .name("@obinexuscomputing/dom-asm")
  .version(packageVersion)
  .description("DOM ASM CLI tool for parsing and analyzing web assets");

program.parse(process.argv);
