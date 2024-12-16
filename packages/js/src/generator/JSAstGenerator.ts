import { JSTokenizer } from "../tokenizer/JSTokenizer";
import { JSValidator, ValidationError } from "../validator/JSValidator";
import { JSParser } from "../parser/JSParser";
import { NodeType, TypedJSASTNode, JSASTNode } from "../types";

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
  format?: "compact" | "pretty";
  indent?: string;
}

export class JSASTGenerator {
  private tokenizer: JSTokenizer;
  private validator: JSValidator;
  private parser: JSParser;

  constructor() {
    this.tokenizer = new JSTokenizer();
    this.validator = new JSValidator();
    this.parser = new JSParser();
  }

  private convertToTypedNode(node: JSASTNode): TypedJSASTNode {
    const nodeType = NodeType[node.type as keyof typeof NodeType];
    if (!nodeType) {
      throw new Error(`Invalid node type: ${node.type}`);
    }

    return {
      type: nodeType,
      value: node.value,
      children: node.children?.map((child: JSASTNode) => this.convertToTypedNode(child)),
      line: node.line,
      column: node.column,
    };
  }

  public generateFromSource(source: string, options: GeneratorOptions = {}): GenerationResult {
    try {
      if (!source) {
        throw new Error("Source code cannot be undefined or empty");
      }

      const tokens = this.tokenizer.tokenize(source);
      const ast = this.parser.parse(tokens);

      return this.processAST(ast, options);
    } catch (err) {
      return {
        success: false,
        errors: [
          {
            code: "E000",
            message: err instanceof Error ? err.message : "Unknown error occurred",
          },
        ],
        ast: undefined,
      };
    }
  }

  public generateFromAST(ast: JSASTNode, options: GeneratorOptions = {}): GenerationResult {
    try {
      return this.processAST(ast, options);
    } catch (err) {
      return {
        success: false,
        errors: [
          {
            code: "E000",
            message: err instanceof Error ? err.message : "Unknown error occurred",
          },
        ],
        ast: ast,
      };
    }
  }

  private processAST(ast: JSASTNode, options: GeneratorOptions): GenerationResult {
    const result: GenerationResult = {
      success: true,
      ast: ast,
    };

    if (options.validate) {
      const validationErrors = this.validator.validate(ast);
      if (validationErrors.length > 0) {
        return {
          success: false,
          errors: this.convertValidationErrors(validationErrors),
          ast: ast,
        };
      }
    }

    try {
      const code = this.generateCode(ast, options);
      return {
        ...result,
        code,
      };
    } catch (err) {
      return {
        success: false,
        errors: [
          {
            code: "E001",
            message: err instanceof Error ? err.message : "Code generation failed",
          },
        ],
        ast: ast,
      };
    }
  }

  private convertValidationErrors(validationErrors: ValidationError[]): GenerationError[] {
    return validationErrors.map((error) => ({
      code: error.code,
      message: error.message,
      location: {
        line: error.node.line,
        column: error.node.column,
      },
    }));
  }

  private generateCode(ast: JSASTNode, options: GeneratorOptions): string {
    const typedAst = this.convertToTypedNode(ast);
    const rawOutput = this.parser.parse(typedAst);
    const code = Array.isArray(rawOutput) ? rawOutput.join("\n") : rawOutput || "";
    return this.formatOutput(code, options);
  }

  private formatOutput(code: string, options: GeneratorOptions): string {
    if (options.format === "compact") {
      return this.formatCompact(code);
    }
    return this.formatPretty(code, options.indent || "  ");
  }

  private formatCompact(code: string): string {
    return code
      .replace(/\s+/g, " ")
      .replace(/\s*([{}[\],;()])\s*/g, "$1")
      .replace(/\s*=\s*/g, "=")
      .replace(/;\s*/g, ";")
      .trim();
  }

  private formatPretty(code: string, indent: string): string {
    const segments = code.split(/({|}|;)/).filter(Boolean);
    let level = 0;
    let result = "";

    for (const segment of segments) {
      const trimmed = segment.trim();
      if (!trimmed) continue;

      if (trimmed === "}") {
        level = Math.max(0, level - 1);
        result += `${indent.repeat(level)}}\n`;
      } else if (trimmed === "{") {
        result += " {\n";
        level++;
      } else if (trimmed === ";") {
        result += ";\n";
      } else {
        result += `${indent.repeat(level)}${trimmed}\n`;
      }
    }

    return result.trimEnd();
  }
}
