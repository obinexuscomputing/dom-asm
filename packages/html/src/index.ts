import { Tokenizer } from "./tokenizer";
import { AST } from "./ast";
import { Validator } from "./validator";
import { ASTOptimizer } from "./optimizer";
import { CodeGenerator } from "./generator";
import { Parser } from "./parser";

// Re-export modules for public API
export { Tokenizer } from "./tokenizer";
export { AST, ASTNode } from "./ast";
export { Validator } from "./validator";
export { ASTOptimizer as Optimizer } from "./optimizer";
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

  declare const define: any; // For AMD compatibility
}

// UMD module initialization
(function (global) {
  const libraryName = "DOMCSS"; 

  const exportedModules = {
    Tokenizer,
    AST,
    Validator,
    Optimizer: ASTOptimizer,
    CodeGenerator,
    Parser,
  };

  if (typeof module === "object" && typeof module.exports === "object") {
    // Node.js and CommonJS
    module.exports = exportedModules;
  } else if (typeof define === "function" && define.amd) {
    // AMD
    define([], () => exportedModules);
  } else {
    // Global (Browser)
    global[libraryName] = exportedModules;
  }
})(typeof window !== "undefined" ? window : global);
