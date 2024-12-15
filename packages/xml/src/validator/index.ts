// Import and re-export tokenizer components
import { XMLBaseTokenizer, DOMXMLTokenizer } from './tokenizer';
import type { DOMXMLToken } from './tokenizer';

// Import and re-export AST components
import type { DOMXMLAST, DOMXMLASTNode } from './ast';
import { DOMXMLOptimizer } from './ast';

// Import and re-export parser
import { DOMXMLParser } from './parser/DOMXMLParser';

// Import and re-export generator
import { DOMXMLGenerator } from './generator/DOMXMLGenerator';
import type { GeneratorOptions } from './generator/DOMXMLGenerator';

// Import and re-export validator
import { 
  DOMXMLValidator,
  type ValidationOptions,
  type ValidationResult,
  type ValidationError
} from './validator/DOMXMLValidator';

// Export all components
export {
  // Tokenizer exports
  XMLBaseTokenizer,
  DOMXMLTokenizer,
  type DOMXMLToken,

  // AST exports
  type DOMXMLAST,
  type DOMXMLASTNode,
  DOMXMLOptimizer,

  // Parser exports
  DOMXMLParser,

  // Generator exports
  DOMXMLGenerator,
  type GeneratorOptions,

  // Validator exports
  DOMXMLValidator,
  type ValidationOptions,
  type ValidationResult,
  type ValidationError
};

// Define options interface for main class
export interface DOMXMLOptions {
  validateOnParse?: boolean;
  optimizeAST?: boolean;
  generatorOptions?: GeneratorOptions;
  validationOptions?: ValidationOptions;
}

// Main DOM XML class
export class DOMXML {
  private tokenizer: DOMXMLTokenizer;
  private parser: DOMXMLParser;
  private optimizer: DOMXMLOptimizer;
  private generator: DOMXMLGenerator;
  private validator: DOMXMLValidator;
  private options: DOMXMLOptions;

  constructor(options: DOMXMLOptions = {}) {
    this.options = {
      validateOnParse: false,
      optimizeAST: true,
      ...options
    };

    this.tokenizer = new DOMXMLTokenizer('');
    this.parser = new DOMXMLParser();
    this.optimizer = new DOMXMLOptimizer();
    this.generator = new DOMXMLGenerator(options.generatorOptions);
    this.validator = new DOMXMLValidator(options.validationOptions);
  }

  public parse(input: string): DOMXMLAST {
    this.tokenizer = new DOMXMLTokenizer(input);
    const tokens = this.tokenizer.tokenize();
    let ast = this.parser.parse(tokens);

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

// Default export
export default DOMXML;