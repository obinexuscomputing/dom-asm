import { JSASTNode } from "src/types";
import { JavaScriptAstNode } from "./JavaScriptAstNode";
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
export declare class JavaScriptAstCodeGenerator {
    private tokenizer;
    private validator;
    private parser;
    constructor();
    private convertToTypedNode;
    generateFromSource(source: string, options?: GeneratorOptions): GenerationResult;
    generateFromAST(ast: JSASTNode, options?: GeneratorOptions): GenerationResult;
    private processAST;
    private convertValidationErrors;
    generate(node: JavaScriptAstNode): string;
    private generateProgram;
    private generateVariableDeclaration;
    private generateIdentifier;
    private generateLiteral;
    private generateBlockStatement;
    private generateIfStatement;
    private generateFunctionDeclaration;
    formatCode(code: string, options?: GeneratorOptions): string;
    private formatCompact;
    private formatPretty;
}
//# sourceMappingURL=JavaScriptAstCodeGenerator.d.ts.map