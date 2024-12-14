import * as HTML from "@obinexuscomputing/html";
/**
 * Parses an HTML string into an Abstract Syntax Tree (AST).
 * @param htmlString The HTML string to parse.
 * @returns The parsed AST.
 */
export function parseHTML(htmlString: string) {
  return HTML.parser.parse(htmlString);
}

/**
 * Optimizes an HTML AST for better performance.
 * @param ast The HTML AST.
 * @returns The optimized HTML AST.
 */
export function optimizeHTML(ast: any) {
  return HTML.optimizer.optimize(ast);
}

/**
 * Validates an HTML AST for correctness.
 * @param ast The HTML AST.
 * @returns True if the AST is valid, false otherwise.
 */
export function validateHTML(ast: any): boolean {
  return HTML.validator.validate(ast);
}
