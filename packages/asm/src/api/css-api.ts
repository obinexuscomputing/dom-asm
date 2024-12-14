import * as CSS from "@obinexuscomputing/css"; 

/**
 * Parses a CSS string and returns an Abstract Syntax Tree (AST).
 * @param cssString The CSS string to parse.
 * @returns The parsed AST.
 */
export function parseCSS(cssString: string) {
  return CSS.parser.parse(cssString);
}

/**
 * Optimizes a CSS AST for better performance.
 * @param ast The CSS AST.
 * @returns The optimized CSS AST.
 */
export function optimizeCSS(ast: any) {
  return CSS.optimizer.optimize(ast);
}

/**
 * Validates a CSS AST for correctness.
 * @param ast The CSS AST.
 * @returns True if the AST is valid, false otherwise.
 */
export function validateCSS(ast: any): boolean {
  return CSS.validator.validate(ast);
}
