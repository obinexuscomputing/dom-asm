#!/usr/bin/env node
/*!
 * @obinexuscomputing/dom-asm v1.0.0
 * (c) 2024 OBINexus Computing
 * Released under the ISC License
 */
'use strict';

var commander = require('commander');
var path = require('path');
var fs = require('fs');
var css = require('@obinexuscomputing/css');
var html = require('@obinexuscomputing/html');
var js = require('@obinexuscomputing/js');
var xml = require('@obinexuscomputing/xml');

// Fetch package version dynamically
const packageJsonPath = path.resolve(__dirname, "../package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
const packageVersion = packageJson.version;
const program = new commander.Command();
/**
 * Validate the existence of a file and return its absolute path.
 */
function validateFile(filePath) {
    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) {
        throw new Error(`File not found: ${filePath}`);
    }
    return absolutePath;
}
/**
 * Unified file processing function for all supported file types.
 */
async function processFile(file, type, options) {
    const filePath = validateFile(file);
    const content = fs.readFileSync(filePath, "utf-8");
    const result = {};
    let tokens, ast;
    try {
        switch (type) {
            case "css":
                tokens = new css.CSSTokenizer(content).tokenize();
                ast = new css.CSSParser(tokens).parse();
                if (options.validate) {
                    const validationErrors = new css.CSSValidator(ast).validate();
                    if (validationErrors.length) {
                        throw new Error(validationErrors.join("\n"));
                    }
                }
                if (options.optimize) {
                    ast = new css.CSSASTOptimizer(ast).optimize();
                    result.optimized = new css.CSSCodeGenerator(ast).generate();
                }
                break;
            case "html":
                tokens = new html.HTMLTokenizer(content).tokenize();
                ast = new html.HTMLParser().parse(tokens);
                if (options.validate) {
                    const validationResult = new html.HTMLValidator().validate(ast);
                    if (!validationResult.valid) {
                        throw new Error(validationResult.errors.join("\n"));
                    }
                }
                if (options.optimize) {
                    ast = new html.HTMLASTOptimizer().optimize(ast);
                    result.optimized = new html.HTMLCodeGenerator().generateHTML(ast);
                }
                break;
            case "js":
                tokens = new js.JSTokenizer().tokenize(content);
                ast = new js.JSASTBuilder(tokens).buildAST();
                if (options.validate) {
                    const validationErrors = new js.JSValidator().validate(ast);
                    if (validationErrors.length) {
                        throw new Error(validationErrors.join("\n"));
                    }
                }
                if (options.optimize) {
                    ast = new js.JSAstMinimizer().optimize(ast);
                    const generationResult = new js.JSAstGenerator().generateFromAST(ast);
                    if (!generationResult.success) {
                        const errorMessages = generationResult.errors
                            ?.map((e) => `${e.code}: ${e.message}`)
                            .join("\n") || "No errors reported.";
                        throw new Error(errorMessages);
                    }
                    result.optimized = generationResult.output;
                }
                break;
            case "xml":
                tokens = new xml.DOMXMLTokenizer(content).tokenize();
                ast = new xml.DOMXMLParser(tokens).parse();
                if (options.validate) {
                    const validationResult = new xml.DOMXMLValidator().validate(ast);
                    if (!validationResult.valid) {
                        throw new Error(validationResult.errors
                            .map((e) => `${e.code}: ${e.message}`)
                            .join("\n"));
                    }
                }
                if (options.optimize) {
                    ast = new xml.DOMXMLASTOptimizer().optimize(ast);
                    result.optimized = new xml.DOMXMLGenerator().generate(ast);
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
        const output = options.format === "text" ? JSON.stringify(result, null, 2) : result;
        if (options.output) {
            fs.writeFileSync(options.output, typeof output === "string" ? output : JSON.stringify(output, null, 2));
        }
        else {
            console.log(output);
        }
    }
    catch (error) {
        console.error(`[Error] ${error instanceof Error ? error.message : error}`);
        throw error;
    }
}
/**
 * Command registration helper.
 */
const registerCommand = (type, description) => {
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
/*!
 * End of bundle for @obinexuscomputing/dom-asm
 */
//# sourceMappingURL=index.js.map
