import * as JS from "@obinexuscomputing/js"; // Assuming the `js` package is published

/**
 * Parses a JavaScript string into an Abstract Syntax Tree (AST).
 * @param jsString The JavaScript string to parse.
 * @returns The parsed AST.
 */
export function parseJS(jsString: string) {
  return JS.parser.parse(jsString);
}

/**
 * Optimizes a JavaScript AST for better performance.
 * @param ast The JavaScript AST.
 * @returns The optimized JavaScript AST.
 */
export function optimizeJS(ast: any) {
  return JS.optimizer.optimize(ast);
}

/**
 * Validates a JavaScript AST for correctness.
 * @param ast The JavaScript AST.
 * @returns True if the AST is valid, false otherwise.
 */
export function validateJS(ast: any): boolean {
  return JS.validator.validate(ast);
}
