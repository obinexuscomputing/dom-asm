import { Command } from "commander";
import path from "path";
import fs from "fs";
// Import specialized packages
import { Tokenizer as CSSTokenizer, Parser as CSSParser, Validator as CSSValidator, ASTOptimizer as CSSOptimizer, Generator as CSSGenerator, } from "@obinexuscomputing/css";
import { Tokenizer as HTMLTokenizer, Parser as HTMLParser, Validator as HTMLValidator, ASTOptimizer as HTMLOptimizer, Generator as HTMLGenerator, } from "@obinexuscomputing/html";
import { Tokenizer as JSTokenizer, JSASTBuilder, ASTOptimizer as JSOptimizer, Generator as JSGenerator, } from "@obinexuscomputing/js";
const program = new Command();
// Validation helpers
function validateFile(filePath) {
    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) {
        throw new Error(`File not found: ${filePath}`);
    }
    return absolutePath;
}
async function processFile(file, type, options) {
    const filePath = validateFile(file);
    const content = fs.readFileSync(filePath, "utf-8");
    let result = {};
    let tokens, ast;
    try {
        switch (type) {
            case "css":
                tokens = new CSSTokenizer(content).tokenize();
                ast = new CSSParser().parse(tokens);
                if (options.validate)
                    new CSSValidator().validate(ast);
                if (options.optimize) {
                    const optimizedAst = new CSSOptimizer().optimize(ast);
                    result.optimized = new CSSGenerator().generate(optimizedAst);
                }
                break;
            case "html":
                tokens = new HTMLTokenizer(content).tokenize();
                ast = new HTMLParser().parse(tokens);
                if (options.validate)
                    new HTMLValidator().validate(ast);
                if (options.optimize) {
                    const optimizedAst = new HTMLOptimizer().optimize(ast);
                    result.optimized = new HTMLGenerator().generate(optimizedAst);
                }
                break;
            case "js":
                tokens = new JSTokenizer(content).tokenize();
                ast = new JSASTBuilder(tokens).buildAST();
                if (options.validate) {
                    console.warn(`[Validation] Not implemented for JS yet.`);
                }
                if (options.optimize) {
                    const optimizedAst = new JSOptimizer().optimize(ast);
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
        console.error(`[Error] ${error.message}`);
        throw error;
    }
}
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
registerCommand("css", "CSS");
registerCommand("html", "HTML");
registerCommand("js", "JavaScript");
program
    .name("@obinexuscomputing/asm")
    .version("1.0.0")
    .description("DOM ASM CLI tool for parsing and analyzing web assets");
program.parse(process.argv);
//# sourceMappingURL=index.js.map