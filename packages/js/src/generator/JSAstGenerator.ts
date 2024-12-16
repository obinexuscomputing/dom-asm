import { JSTokenizer, JSToken } from "../tokenizer/JSTokenizer";
import { JSValidator, ValidationError } from "../validator/JSValidator";
import { JSParser, TypedJSASTNode } from "../parser/JSParser";
import { JSASTBuilder } from "../ast/JSAst";

export interface GenerationError {
  code: string;
  message: string;
  location?: {
    line?: number;
    column?: number;
  };
}

export interface GenerationResult {
  success: boolean;
  code?: string;
  errors?: GenerationError[];
  ast?: TypedJSASTNode;
}

export interface GeneratorOptions {
  validate?: boolean;
  format?: 'compact' | 'pretty';
  indent?: string;
}

export class JSGenerator {
  private tokenizer: JSTokenizer;
  private validator: JSValidator;
  private parser: JSParser;

  constructor() {
    this.tokenizer = new JSTokenizer();
    this.validator = new JSValidator();
    this.parser = new JSParser();
  }

  public generateFromSource(source: string, options: GeneratorOptions = {}): GenerationResult {
    try {
      // Step 1: Tokenize source
      const tokens = this.tokenizer.tokenize(source);
      
      // Step 2: Build AST
      const builder = new JSASTBuilder(tokens);
      const ast = builder.buildAST() as TypedJSASTNode;

      // Step 3: Validate if requested
      if (options.validate) {
        const validationErrors = this.validator.validate(ast);
        if (validationErrors.length > 0) {
          return {
            success: false,
            errors: this.convertValidationErrors(validationErrors),
            ast
          };
        }
      }

      // Step 4: Generate code
      const code = this.generateCode(ast, options);
      
      return {
        success: true,
        code,
        ast
      };

    } catch (err) {
      return {
        success: false,
        errors: [{
          code: 'E000',
          message: err instanceof Error ? err.message : 'Unknown error occurred'
        }]
      };
    }
  }

  public generateFromAST(ast: TypedJSASTNode, options: GeneratorOptions = {}): GenerationResult {
    try {
      // Step 1: Validate if requested
      if (options.validate) {
        const validationErrors = this.validator.validate(ast);
        if (validationErrors.length > 0) {
          return {
            success: false,
            errors: this.convertValidationErrors(validationErrors),
            ast
          };
        }
      }

      // Step 2: Generate code
      const code = this.generateCode(ast, options);
      
      return {
        success: true,
        code,
        ast
      };

    } catch (err) {
      return {
        success: false,
        errors: [{
          code: 'E000',
          message: err instanceof Error ? err.message : 'Unknown error occurred'
        }]
      };
    }
  }

  private convertValidationErrors(validationErrors: ValidationError[]): GenerationError[] {
    return validationErrors.map(error => ({
      code: error.code,
      message: error.message,
      location: {
        line: error.node.line,
        column: error.node.column
      }
    }));
  }

  private generateCode(ast: TypedJSASTNode, options: GeneratorOptions): string {
    const rawOutput = this.parser.parse(ast);
    
    if (Array.isArray(rawOutput)) {
      return this.formatOutput(rawOutput.join('\n'), options);
    }

    return this.formatOutput(rawOutput || '', options);
  }

  private formatOutput(code: string, options: GeneratorOptions): string {
    if (options.format === 'compact') {
      return this.formatCompact(code);
    }
    return this.formatPretty(code, options.indent || '  ');
  }

  private formatCompact(code: string): string {
    return code
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}[\],;()])\s*/g, '$1')
      .replace(/\s*=\s*/g, '=')
      .replace(/;\s*/g, ';')
      .trim();
  }

  private formatPretty(code: string, indent: string): string {
    let level = 0;
    let result = '';
    const lines = code.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      if (trimmedLine.endsWith('}')) {
        level = Math.max(0, level - 1);
      }

      result += `${indent.repeat(level)}${trimmedLine}\n`;

      if (trimmedLine.endsWith('{')) {
        level++;
      }
    }

    return result.trimEnd();
  }
}