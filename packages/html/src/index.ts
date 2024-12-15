export { Tokenizer } from "./src/tokenizer";
export { Parser } from "./src/parser";
export { Validator } from "./src/validator";
export { ASTOptimizer as Optimizer } from "./src/optimizer";
export { Generator } from "./src/generator";

// Re-export modules for public API
export { HTMLTokenizer } from "./tokenizer";
export { AST, ASTNode } from "./ast";
export { Validator } from "./validator";
export { ASTOptimizer as Optimizer } from "./optimizer";
export { CodeGenerator } from "./generator";
export { HTMLParser, HTMLParserError } from "./parser";
