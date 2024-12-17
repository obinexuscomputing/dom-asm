#!/usr/bin/env node
/*!
 * @obinexuscomputing/dom-asm v1.0.0
 * (c) 2024 Obinexus Computing
 * Released under the ISC License
 */
'use strict';

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const commander_1 = require("commander");
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const css_1 = require("@obinexuscomputing/css");
const html_1 = require("@obinexuscomputing/html");
const js_1 = require("@obinexuscomputing/js");
const xml_1 = require("@obinexuscomputing/xml");
// Fetch package version dynamically
const packageJsonPath = path_1.default.resolve(__dirname, "../package.json");
const packageJson = JSON.parse(fs_1.default.readFileSync(packageJsonPath, "utf-8"));
const packageVersion = packageJson.version;
const program = new commander_1.Command();
/**
 * Validate the existence of a file and return its absolute path.
 */
function validateFile(filePath) {
    const absolutePath = path_1.default.resolve(filePath);
    if (!fs_1.default.existsSync(absolutePath)) {
        throw new Error(`File not found: ${filePath}`);
    }
    return absolutePath;
}
/**
 * Unified file processing function for all supported file types.
 */
async function processFile(file, type, options) {
    const filePath = validateFile(file);
    const content = fs_1.default.readFileSync(filePath, "utf-8");
    const result = {};
    let tokens, ast;
    try {
        switch (type) {
            case "css":
                tokens = new css_1.CSSTokenizer(content).tokenize();
                ast = new css_1.CSSParser(tokens).parse();
                if (options.validate) {
                    const validationErrors = new css_1.CSSValidator(ast).validate();
                    if (validationErrors.length) {
                        throw new Error(validationErrors.join("\n"));
                    }
                }
                if (options.optimize) {
                    ast = new css_1.CSSASTOptimizer(ast).optimize();
                    result.optimized = new css_1.CSSCodeGenerator(ast).generate();
                }
                break;
            case "html":
                tokens = new html_1.HTMLTokenizer(content).tokenize();
                ast = new html_1.HTMLParser().parse(tokens);
                if (options.validate) {
                    const validationResult = new html_1.HTMLValidator().validate(ast);
                    if (!validationResult.valid) {
                        throw new Error(validationResult.errors.join("\n"));
                    }
                }
                if (options.optimize) {
                    ast = new html_1.HTMLASTOptimizer().optimize(ast);
                    result.optimized = new html_1.HTMLCodeGenerator().generateHTML(ast);
                }
                break;
            case "js":
                tokens = new js_1.JSTokenizer().tokenize(content);
                ast = new js_1.JSASTBuilder(tokens).buildAST();
                if (options.validate) {
                    const validationErrors = new js_1.JSValidator().validate(ast);
                    if (validationErrors.length) {
                        throw new Error(validationErrors.join("\n"));
                    }
                }
                if (options.optimize) {
                    ast = new js_1.JSAstMinimizer().optimize(ast);
                    const generationResult = new js_1.JSAstGenerator().generateFromAST(ast);
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
                tokens = new xml_1.DOMXMLTokenizer(content).tokenize();
                ast = new xml_1.DOMXMLParser(tokens).parse();
                if (options.validate) {
                    const validationResult = new xml_1.DOMXMLValidator().validate(ast);
                    if (!validationResult.valid) {
                        throw new Error(validationResult.errors
                            .map((e) => `${e.code}: ${e.message}`)
                            .join("\n"));
                    }
                }
                if (options.optimize) {
                    ast = new xml_1.DOMXMLASTOptimizer().optimize(ast);
                    result.optimized = new xml_1.DOMXMLGenerator().generate(ast);
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
            fs_1.default.writeFileSync(options.output, typeof output === "string" ? output : JSON.stringify(output, null, 2));
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
//# sourceMappingURL=index.cjs.map
