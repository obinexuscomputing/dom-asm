import { DOMXMLAST } from "./ast/DOMXMLAST";
import { DOMXMLASTOptimizer } from "./ast/DOMXMLASTOptimizer";
import { GeneratorOptions, DOMXMLGenerator } from "./generator/DOMXMLGenerator";
import { DOMXMLParser } from "./parser/DOMXMLParser";
import { DOMXMLTokenizer } from "./tokenizer/DOMXMLTokenizer";
import { ValidationOptions, DOMXMLValidator, ValidationResult } from "./validator/DOMXMLValidator";

// Export AST types and components
export type { DOMXMLAST, DOMXMLASTNode } from "./ast/DOMXMLAST";
export { DOMXMLASTOptimizer } from "./ast/DOMXMLASTOptimizer";

// Export tokenizer components
export { XMLBaseTokenizer } from "./tokenizer/XMLBaseTokenizer";
export { DOMXMLTokenizer } from "./tokenizer/DOMXMLTokenizer";
export type { DOMXMLToken } from "./tokenizer/DOMXMLTokenizer";

// Export parser
export { DOMXMLParser } from "./parser/DOMXMLParser";

// Export generator
export { DOMXMLGenerator } from "./generator/DOMXMLGenerator";
export type { GeneratorOptions } from "./generator/DOMXMLGenerator";

// Export validator
export {
  DOMXMLValidator,
  type ValidationOptions,
  type ValidationResult,
  type ValidationError,
  type XMLSchema,
  type XMLElementSchema,
} from "./validator/DOMXMLValidator";

// Export main interface
export interface DOMXMLOptions {
  validateOnParse?: boolean;
  optimizeAST?: boolean;
  generatorOptions?: GeneratorOptions;
  validationOptions?: ValidationOptions;
}

export class DOMXML {
  private tokenizer: DOMXMLTokenizer;
  private parser: DOMXMLParser;
  private optimizer: DOMXMLASTOptimizer;
  private generator: DOMXMLGenerator;
  private validator: DOMXMLValidator;
  private options: DOMXMLOptions;

  constructor(options: DOMXMLOptions = {}) {
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

  public parse(input: string): DOMXMLAST {
    this.tokenizer = new DOMXMLTokenizer(input);
    const tokens = this.tokenizer.tokenize();
    
    // Update parser with new tokens
    this.parser.setTokens(tokens);
    let ast = this.parser.parse();

    if (this.options.validateOnParse) {
      const validationResult = this.validator.validate(ast);
      if (!validationResult.valid) {
        throw new Error(
          `XML Validation failed: ${JSON.stringify(validationResult.errors)}`
        );
      }
    }

    if (this.options.optimizeAST) {
      ast = this.optimizer.optimize(ast);
    }

    return ast;
  }

  // Rest of the implementation remains the same
  public generate(ast: DOMXMLAST): string {
    return this.generator.generate(ast);
  }

  public validate(ast: DOMXMLAST): ValidationResult {
    return this.validator.validate(ast);
  }

  public optimize(ast: DOMXMLAST): DOMXMLAST {
    return this.optimizer.optimize(ast);
  }
}