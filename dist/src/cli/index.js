import { Command } from "commander";
import path from 'path';
import fs from 'fs';
// Import specialized packages
import * as cssPackage from '@obinexuscomputing/css';
import * as htmlPackage from '@obinexuscomputing/html';
import * as jsPackage from '@obinexuscomputing/js';
const program = new Command();
// Validation helpers
function validateFile(filePath) {
    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) {
        throw new Error(`File not found: ${filePath}`);
    }
    return absolutePath;
}
// Generic processing function
async function processFile(file, type, options) {
    const filePath = validateFile(file);
    const content = fs.readFileSync(filePath, 'utf-8');
    let result = {};
    switch (type) {
        case 'css': {
            const tokens = new cssPackage.tokenizer.Tokenizer().tokenize(content);
            const ast = new cssPackage.parser.Parser().parse(tokens);
            if (options.validate) {
                new cssPackage.validator.Validator().validate(ast);
            }
            if (options.optimize) {
                const optimizedAst = new cssPackage.optimizer.Optimizer().optimize(ast);
                result.optimized = new cssPackage.generator.Generator().generate(optimizedAst);
            }
            result.ast = ast;
            result.tokens = tokens;
            break;
        }
        case 'html': {
            const tokens = new htmlPackage.tokenizer.Tokenizer().tokenize(content);
            const ast = new htmlPackage.parser.Parser().parse(tokens);
            if (options.validate) {
                new htmlPackage.validator.Validator().validate(ast);
            }
            if (options.optimize) {
                const optimizedAst = new htmlPackage.optimizer.Optimizer().optimize(ast);
                result.optimized = new htmlPackage.generator.Generator().generate(optimizedAst);
            }
            result.ast = ast;
            result.tokens = tokens;
            break;
        }
        case 'js': {
            const tokens = new jsPackage.tokenizer.Tokenizer().tokenize(content);
            const ast = new jsPackage.parser.Parser().parse(tokens);
            if (options.validate) {
                new jsPackage.validator.Validator().validate(ast);
            }
            if (options.optimize) {
                const optimizedAst = new jsPackage.optimizer.Optimizer().optimize(ast);
                result.optimized = new jsPackage.generator.Generator().generate(optimizedAst);
            }
            result.ast = ast;
            result.tokens = tokens;
            break;
        }
    }
    const output = options.format === 'text' ?
        JSON.stringify(result, null, 2) :
        result;
    if (options.output) {
        fs.writeFileSync(options.output, typeof output === 'string' ? output : JSON.stringify(output, null, 2));
    }
    else {
        console.log(output);
    }
    return result;
}
// CLI Configuration
program
    .name('@obinexuscomputing/asm')
    .version('1.0.0')
    .description('DOM ASM CLI tool for parsing and analyzing web assets');
// Common options for all commands
const commonOptions = (command) => {
    return command
        .option('-o, --optimize', 'Optimize the AST')
        .option('-v, --validate', 'Validate the AST')
        .option('-f, --format <format>', 'Output format (json or text)', 'json')
        .option('--output <file>', 'Output file (defaults to stdout)')
        .option('-d, --debug', 'Enable debug output');
};
// CSS Commands
const cssCommand = program.command('css')
    .description('CSS processing commands');
commonOptions(cssCommand.command('parse')
    .argument('<file>', 'CSS file to parse')
    .description('Parse a CSS file')).action((file, options) => {
    processFile(file, 'css', options)
        .catch(error => {
        console.error('Error:', error.message);
        process.exit(1);
    });
});
// HTML Commands
const htmlCommand = program.command('html')
    .description('HTML processing commands');
commonOptions(htmlCommand.command('parse')
    .argument('<file>', 'HTML file to parse')
    .description('Parse an HTML file')).action((file, options) => {
    processFile(file, 'html', options)
        .catch(error => {
        console.error('Error:', error.message);
        process.exit(1);
    });
});
// JavaScript Commands
const jsCommand = program.command('js')
    .description('JavaScript processing commands');
commonOptions(jsCommand.command('parse')
    .argument('<file>', 'JavaScript file to parse')
    .description('Parse a JavaScript file')).action((file, options) => {
    processFile(file, 'js', options)
        .catch(error => {
        console.error('Error:', error.message);
        process.exit(1);
    });
});
// Error handling for unknown commands
program.on('command:*', function (operands) {
    console.error(`Error: Unknown command '${operands[0]}'`);
    const availableCommands = program.commands.map(cmd => cmd.name());
    console.error('Available commands:', availableCommands.join(', '));
    process.exit(1);
});
export function run() {
    program.parse(process.argv);
}
//# sourceMappingURL=index.js.map