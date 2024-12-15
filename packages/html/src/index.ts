import { HTMLTokenizer } from "./tokenizer";
import { AST } from "./ast";
import { Validator } from "./validator";
import { ASTOptimizer } from "./optimizer";
import { CodeGenerator } from "./generator";
import { HTMLParser, HTMLParserError } from "./parser";

// Re-export modules for public API
export { HTMLTokenizer } from "./tokenizer";
export { AST, ASTNode } from "./ast";
export { Validator } from "./validator";
export { ASTOptimizer as Optimizer } from "./optimizer";
export { CodeGenerator } from "./generator";
export { HTMLParser, HTMLParserError } from "./parser";
