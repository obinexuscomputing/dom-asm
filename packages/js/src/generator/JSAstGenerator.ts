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

export class JSAstGenerator {
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

        // Tokenize the source code
        const tokens = this.tokenizer.tokenize(source);

        // Parse the tokens into an initial AST
        const rawAst = this.parser.parse(tokens);

        // Ensure the AST conforms to TypedJSASTNode
        const typedAst = this.convertToTypedNode(rawAst);

        return this.processAST(typedAst, options);
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
    const codeParts: string[] = [];
    this.traverseAST(ast, codeParts);
    const rawCode = codeParts.join(" ").trim();
    return this.formatOutput(rawCode, options);
  }

  private traverseAST(node: JSASTNode, codeParts: string[]): void {
    switch (node.type) {
      case NodeType.Program:
        node.children?.forEach((child) => this.traverseAST(child, codeParts));
        break;
      case NodeType.VariableDeclaration:
        codeParts.push(`${node.value} `);
        node.children?.forEach((child) => this.traverseAST(child, codeParts));
        codeParts.push(";");
        break;
      case NodeType.Identifier:
      case NodeType.Literal:
        codeParts.push(node.value || "");
        break;
      case NodeType.BinaryExpression:
        if (node.children && node.children.length === 2) {
          this.traverseAST(node.children[0], codeParts);
          codeParts.push(` ${node.value} `);
          this.traverseAST(node.children[1], codeParts);
        }
        break;
      default:
        throw new Error(`Unsupported node type: ${node.type}`);
    }
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
