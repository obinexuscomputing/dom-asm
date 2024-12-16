// JSGenerator.ts
import { JSTokenizer, JSToken } from "../tokenizer/JSTokenizer";
import { JSValidator, ValidationError } from "../validator/JSValidator";
import { JSParser, TypedJSASTNode, NodeType } from "../parser/JSParser";
import { JSASTBuilder, JSASTNode } from "../ast/JSAst";

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
  ast?: JSASTNode;
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

  private isValidNodeType(type: string): type is NodeType {
    const validTypes: NodeType[] = [
      "Program", "Statement", "Expression", "VariableDeclaration",
      "InlineConstant", "BinaryExpression", "Identifier", "Literal",
      "FunctionDeclaration", "ReturnStatement", "IfStatement", "BlockStatement"
    ];
    return validTypes.includes(type as NodeType);
  }

  private convertToTypedNode(node: JSASTNode): TypedJSASTNode {
    if (!this.isValidNodeType(node.type)) {
      throw new Error(`Invalid node type: ${node.type}`);
    }

    return {
      ...node,
      type: node.type as NodeType,
      children: node.children?.map(child => this.convertToTypedNode(child))
    };
  }

  public generateFromSource(source: string, options: GeneratorOptions = {}): GenerationResult {
    try {
      // Handle undefined input
      if (!source) {
        throw new Error('Source code cannot be undefined or empty');
      }

      const tokens = this.tokenizer.tokenize(source);
      const builder = new JSASTBuilder(tokens);
      const rawAst = builder.buildAST();

      // Always store the AST in the result
      const result: GenerationResult = {
        success: true,
        ast: rawAst
      };

      if (options.validate) {
        const validationErrors = this.validator.validate(rawAst);
        if (validationErrors.length > 0) {
          return {
            ...result,
            success: false,
            errors: this.convertValidationErrors(validationErrors)
          };
        }
      }

      const ast = this.convertToTypedNode(rawAst);
      const code = this.generateCode(ast, options);
      
      return {
        ...result,
        code
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

  public generateFromAST(inputAst: JSASTNode, options: GeneratorOptions = {}): GenerationResult {
    try {
      // Always store the input AST in the result
      const result: GenerationResult = {
        success: true,
        ast: inputAst
      };

      if (options.validate) {
        const validationErrors = this.validator.validate(inputAst);
        if (validationErrors.length > 0) {
          return {
            ...result,
            success: false,
            errors: this.convertValidationErrors(validationErrors)
          };
        }
      }

      const ast = this.convertToTypedNode(inputAst);
      const code = this.generateCode(ast, options);
      
      return {
        ...result,
        code
      };

    } catch (err) {
      return {
        success: false,
        errors: [{
          code: 'E000',
          message: err instanceof Error ? err.message : 'Unknown error occurred'
        }],
        ast: inputAst // Keep the AST even in error cases
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
    const lines = code.split(/[{;}]/g).filter(line => line.trim());
    let result = '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Add closing brace on its own line
      if (trimmedLine.startsWith('}')) {
        level = Math.max(0, level - 1);
      }

      result += `${indent.repeat(level)}${trimmedLine}\n`;

      // Increase indent level after opening brace
      if (trimmedLine.endsWith('{')) {
        level++;
      }
    }

    // Add appropriate braces and semicolons back
    result = result
      .replace(/\n(\s*[^}\s])/g, ';\n$1')
      .replace(/\n\s*([^{;\s].*?)\n/g, ' {\n$1\n}\n');

    return result.trim();
  }
}