// Core DOM XML components
export { DOMXMLTokenizer } from './tokenizer/DOMXMLTokenizer';
export { XMLBaseTokenizer } from './tokenizer/XMLBaseTokenizer';
export type { DOMXMLToken } from './tokenizer/DOMXMLTokenizer';

// AST related exports
export { 
  type DOMXMLAST,
  type DOMXMLASTNode 
} from './ast/DOMXMLAST';
export { DOMXMLOptimizer } from './ast/DOMXMLOptimizer';

// Parser exports
export { DOMXMLParser } from './parser/DOMXMLParser';

// Generator exports
export { 
  DOMXMLGenerator,
  type GeneratorOptions 
} from './generator/DOMXMLGenerator';

// Validator exports
export { 
  DOMXMLValidator,
  type ValidationOptions,
  type ValidationResult,
  type ValidationError 
} from './validator/DOMXMLValidator';

// Utility types and interfaces
export interface DOMXMLOptions {
  validateOnParse?: boolean;
  optimizeAST?: boolean;
  generatorOptions?: GeneratorOptions;
  validationOptions?: ValidationOptions;
}

// Main DOM XML class for simplified usage
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
    // Initialize tokenizer with input
    this.tokenizer = new DOMXMLTokenizer(input);
    
    // Tokenize
    const tokens = this.tokenizer.tokenize();
    
    // Parse
    let ast = this.parser.parse(tokens);
    
    // Validate if requested
    if (this.options.validateOnParse) {
      const validationResult = this.validator.validate(ast);
      if (!validationResult.valid) {
        throw new Error(`XML Validation failed: ${JSON.stringify(validationResult.errors)}`);
      }
    }
    
    // Optimize if requested
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