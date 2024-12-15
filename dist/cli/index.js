import { Command } from "commander";
import path from "path";
import fs from "fs";
import { CSSTokenizer, CSSParser, CSSValidator, CSSASTOptimizer, CSSCodeGenerator, } from "@obinexuscomputing/css";
import { HTMLTokenizer, HTMLParser, HTMLValidator, HTMLASTOptimizer, HTMLCodeGenerator, } from "@obinexuscomputing/html";
import { JSTokenizer, JSASTBuilder, JSValidator, JSASTOptimizer, JSCodeGenerator, } from "@obinexuscomputing/js";
const program = new Command();
// Validation helpers
function validateFile(filePath) {
    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) {
        throw new Error(`File not found: ${filePath}`);
    }
    return absolutePath;
}
// Generic file processing function
async function processFile(file, type, options) {
    const filePath = validateFile(file);
    const content = fs.readFileSync(filePath, "utf-8");
    let result = {};
    let tokens, ast;
    try {
        switch (type) {
            case "css":
                tokens = new CSSTokenizer(content).tokenize();
                ast = new CSSParser(tokens).parse();
                if (options.validate) {
                    const validator = new CSSValidator(ast);
                    const validationErrors = validator.validate();
                    if (validationErrors.length > 0) {
                        throw new Error(`Validation errors:\n${validationErrors.join("\n")}`);
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
                    const validationResult = validator.validate(ast); // Validate the AST
                    if (!validationResult.valid) {
                        throw new Error(`Validation errors:\n${validationResult.errors.join("\n")}`);
                    }
                }
                if (options.optimize) {
                    const optimizer = new HTMLASTOptimizer();
                    ast = optimizer.optimize(ast);
                    const generator = new HTMLCodeGenerator();
                    result.optimized = generator.generateHTML(ast); // Generate optimized HTML
                }
                break;
            case "js":
                tokens = new JSTokenizer().tokenize(content);
                ast = new JSASTBuilder(tokens).buildAST();
                if (options.validate) {
                    const validator = new JSValidator();
                    const validationErrors = validator.validate(ast);
                    if (validationErrors.length > 0) {
                        throw new Error(`Validation errors:\n${validationErrors.join("\n")}`);
                    }
                }
                if (options.optimize) {
                    const optimizer = new JSASTOptimizer();
                    ast = optimizer.optimize(ast);
                    const generator = new JSCodeGenerator();
                    result.optimized = generator.generate(ast);
                }
                break;
        }
        result.tokens = tokens;
        result.ast = ast;
        if (options.debug) {
            console.debug(`[DEBUG] Tokens: ${JSON.stringify(tokens, null, 2)}`);
            console.debug(`[DEBUG] AST: ${JSON.stringify(ast, null, 2)}`);
        }
        const output = options.format === "text"
            ? JSON.stringify(result, null, 2)
            : result;
        if (options.output) {
            fs.writeFileSync(options.output, typeof output === "string" ? output : JSON.stringify(output, null, 2));
        }
        else {
            console.log(output);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`[Error] ${error.message}`);
        }
        else {
            console.error("[Error] Unknown error occurred");
        }
        throw error;
    }
}
// Command registration function
const registerCommand = (type, description) => {
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
    .name("@obinexuscomputing/dom-asm")
    .version("1.0.0")
    .description("DOM ASM CLI tool for parsing and analyzing web assets");
// Parse command-line arguments
program.parse(process.argv);
//# sourceMappingURL=index.js.map