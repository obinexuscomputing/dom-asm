import { DOMXMLASTOptimizer } from "./ast/DOMXMLASTOptimizer";
import { DOMXMLGenerator } from "./generator/DOMXMLGenerator";
import { DOMXMLParser } from "./parser/DOMXMLParser";
import { DOMXMLTokenizer } from "./tokenizer/DOMXMLTokenizer";
import { DOMXMLValidator } from "./validator/DOMXMLValidator";
export { DOMXMLASTOptimizer } from "./ast/DOMXMLASTOptimizer";
// Export tokenizer components
export { XMLBaseTokenizer } from "./tokenizer/XMLBaseTokenizer";
export { DOMXMLTokenizer } from "./tokenizer/DOMXMLTokenizer";
// Export parser
export { DOMXMLParser } from "./parser/DOMXMLParser";
// Export generator
export { DOMXMLGenerator } from "./generator/DOMXMLGenerator";
// Export validator
export { DOMXMLValidator, } from "./validator/DOMXMLValidator";
export class DOMXML {
    constructor(options = {}) {
        this.options = {
            validateOnParse: false,
            optimizeAST: true,
            ...options,
        };
        this.tokenizer = new DOMXMLTokenizer("");
        this.parser = new DOMXMLParser();
        this.optimizer = new DOMXMLASTOptimizer();
        this.generator = new DOMXMLGenerator(options.generatorOptions);
        this.validator = new DOMXMLValidator(options.validationOptions);
    }
    parse(input) {
        this.tokenizer = new DOMXMLTokenizer(input);
        const tokens = this.tokenizer.tokenize();
        // Update parser with new tokens
        this.parser.setTokens(tokens);
        let ast = this.parser.parse();
        if (this.options.validateOnParse) {
            const validationResult = this.validator.validate(ast);
            if (!validationResult.valid) {
                throw new Error(`XML Validation failed: ${JSON.stringify(validationResult.errors)}`);
            }
        }
        if (this.options.optimizeAST) {
            ast = this.optimizer.optimize(ast);
        }
        return ast;
    }
    // Rest of the implementation remains the same
    generate(ast) {
        return this.generator.generate(ast);
    }
    validate(ast) {
        return this.validator.validate(ast);
    }
    optimize(ast) {
        return this.optimizer.optimize(ast);
    }
}
//# sourceMappingURL=index.js.map