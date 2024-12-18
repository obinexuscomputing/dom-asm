import { JSASTNode, TypedJSASTNode, ValidationError } from "src/types";
import { JavaScriptValidator } from "src/validator";
import { JavaScriptAstNode, JavaScriptNodeTypeMap } from "./JavaScriptAstNode";
import { JavaScriptParser } from "./JavaScriptParser"; // Add this line to import JavaScriptParser
import { JavaScriptTokenizer } from "src/tokenizer/JavaScriptTokenizer";


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
  output?: string;
}

export interface GeneratorOptions {
  validate?: boolean;
  format?: "compact" | "pretty";
  indent?: string;
}

export class JavaScriptAstCodeGenerator {
  private tokenizer: JavaScriptTokenizer;
  private validator: JavaScriptValidator;
  private parser: JavaScriptParser;

  constructor() {
    this.tokenizer = new JavaScriptTokenizer();
    this.validator = new JavaScriptValidator();
    this.parser = new JavaScriptParser();
  }

  // Method to convert raw AST node to typed node
  private convertToTypedNode(node: JSASTNode): TypedJSASTNode {
    const nodeTypeValue = JavaScriptNodeTypeMap[node.type as keyof typeof JavaScriptNodeTypeMap];
    if (!nodeTypeValue) {
      throw new Error(`Invalid node type: ${node.type}`);
    }

    return {
      type: nodeTypeValue,
      value: node.value,
      children: node.children?.map((child: JSASTNode) => this.convertToTypedNode(child)),
      line: node.line,
      column: node.column,
    };
  }

  // Generate code from source string
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
      const typedAst = this.convertToTypedNode(rawAst) as JSASTNode

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

  // Generate code from existing AST
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

  // Process the AST with optional validation
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
      // Use the combined generation method
      const code = this.generate(ast);
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

  // Convert validation errors to generation errors
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

  // Main generation method
  public generate(node: JavaScriptAstNode): string {
    switch (node.type) {
      case JavaScriptNodeTypeMap.Program:
        return this.generateProgram(node);
      case JavaScriptNodeTypeMap.VariableDeclaration:
        return this.generateVariableDeclaration(node);
      case JavaScriptNodeTypeMap.Identifier:
        return this.generateIdentifier(node);
      case JavaScriptNodeTypeMap.Literal:
        return this.generateLiteral(node);
      case JavaScriptNodeTypeMap.BlockStatement:
        return this.generateBlockStatement(node);
      case JavaScriptNodeTypeMap.IfStatement:
        return this.generateIfStatement(node);
      case JavaScriptNodeTypeMap.FunctionDeclaration:
        return this.generateFunctionDeclaration(node);
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  // Generation methods for specific node types
  private generateProgram(node: JavaScriptAstNode): string {
    return node.children?.map((child: JavaScriptAstNode) => this.generate(child)).join('\n') || '';
  }

  private generateVariableDeclaration(node: JavaScriptAstNode): string {
    const [identifier, initializer] = node.children!;
    return `${node.value} ${this.generate(identifier)} = ${this.generate(initializer)};`;
  }

  private generateIdentifier(node: JavaScriptAstNode): string {
    return node.value!;
  }

  private generateLiteral(node: JavaScriptAstNode): string {
    return node.value!;
  }

  private generateBlockStatement(node: JavaScriptAstNode): string {
    const body = node.children?.map((child: JavaScriptAstNode) => this.generate(child)).join('\n') || '';
    return `{${body}}`;
  }

  private generateIfStatement(node: JavaScriptAstNode): string {
    const [condition, consequence, alternate] = node.children!;
    let code = `if (${this.generate(condition)}) ${this.generate(consequence)}`;
    if (alternate) {
      code += ` else ${this.generate(alternate)}`;
    }
    return code;
  }

  private generateFunctionDeclaration(node: JavaScriptAstNode): string {
    const [identifier, ...paramsAndBody] = node.children!;
    const params: string = paramsAndBody.slice(0, -1).map((param: JavaScriptAstNode) => this.generate(param)).join(', ');
    const body = this.generate(paramsAndBody[paramsAndBody.length - 1]);
    return `function ${this.generate(identifier)}(${params}) ${body}`;
  }

  // Additional formatting methods from the previous implementation
  public formatCode(code: string, options: GeneratorOptions = {}): string {
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