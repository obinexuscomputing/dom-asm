import { Tokenizer } from "./tokenizer";
import { Validator } from "./validator";
import { CodeGenerator } from "./generator";
import { Parser } from "./parser";

// Re-export modules for public API
export { Tokenizer } from "./tokenizer";
export {  ASTNode } from "./ast";
export { Validator } from "./validator";
export {  ASTOptimizer } from "./optimizer";
export { CodeGenerator } from "./generator";
export { Parser } from "./parser";

// Global type declaration for window or global usage
declare global {
  interface Window {
    DOMCSS?: any;
    DOMHTML?: any;
    DOMJS?: any;
  }

  namespace NodeJS {
    interface Global {
      DOMCSS?: any;
      DOMHTML?: any;
      DOMJS?: any;
    }
  }

}
