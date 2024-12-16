import { JSTokenizer, JSToken } from "../tokenizer/JSTokenizer";
import { JSValidator, ValidationError } from "../validator/JSValidator";
import { JSParser, TypedJSASTNode } from "../parser/JSParser";
import { JSASTBuilder } from "../ast/JSAst";

export interface GenerationResult {
  success: boolean;
  code?: string;
  validationErrors?: ValidationError[];
  error?: string;
}

export interface GeneratorOptions {
  validate?: boolean;
  optimize?: boolean;
  format?: 'compact' | 'pretty';
  indent?: string;
}

export class JSGenerator {
  private tokenizer: JSTokenizer;
  private validator: JSValidator;
  private parser: JSParser;
  private builder: JSASTBuilder;

  constructor() {
    this.tokenizer = new JSTokenizer();
    this.validator = new JSValidator();
    this.parser = new JSParser();
    this.builder = new JSASTBuilder([]);
  }

  public generateFromSource(source: string, options: GeneratorOptions = {}): GenerationResult {
    try {
      // Tokenize the source code
      const tokens = this.tokenizer.tokenize(source);
      
      // Build AST from tokens
      this.builder = new JSASTBuilder(tokens);
      const ast = this.builder.buildAST();

      // Validate if requested
      if (options.validate) {
        const validationErrors = this.validator.validate(ast);
        if (validationErrors.length > 0) {
          return {
            success: false,
            validationErrors
          };
        }
      }

      // Parse and generate code
      const parsedResult = this.parser.parse(ast as TypedJSASTNode);
      
      if (Array.isArray(parsedResult)) {
        return {
          success: true,
          code: this.formatOutput(parsedResult.join('\n'), options)
        };
      }

      return {
        success: true,
        code: this.formatOutput(parsedResult || '', options)
      };

    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error occurred'
      };
    }
  }

  public generateFromAST(ast: TypedJSASTNode, options: GeneratorOptions = {}): GenerationResult {
    try {
      // Validate if requested
      if (options.validate) {
        const validationErrors = this.validator.validate(ast);
        if (validationErrors.length > 0) {
          return {
            success: false,
            validationErrors
          };
        }
      }

      // Parse and generate code
      const parsedResult = this.parser.parse(ast);
      
      if (Array.isArray(parsedResult)) {
        return {
          success: true,
          code: this.formatOutput(parsedResult.join('\n'), options)
        };
      }

      return {
        success: true,
        code: this.formatOutput(parsedResult || '', options)
      };

    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error occurred'
      };
    }
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
      .replace(/\s*:\s*/g, ':')
      .trim();
  }

  private formatPretty(code: string, indent: string): string {
    let level = 0;
    let formatted = '';
    let inString = false;
    let lastChar = '';

    for (const char of code) {
      // Handle string literals
      if (char === '"' || char === "'") {
        if (lastChar !== '\\') {
          inString = !inString;
        }
        formatted += char;
        continue;
      }

      if (inString) {
        formatted += char;
        continue;
      }

      switch (char) {
        case '{':
          level++;
          formatted += '{\n' + indent.repeat(level);
          break;
        case '}':
          level--;
          formatted = formatted.trimEnd() + '\n' + indent.repeat(level) + '}';
          break;
        case ';':
          formatted += ';\n' + indent.repeat(level);
          break;
        case '\n':
          if (lastChar !== '}') {
            formatted += '\n' + indent.repeat(level);
          }
          break;
        default:
          formatted += char;
      }

      lastChar = char;
    }

    return formatted.trim();
  }
}