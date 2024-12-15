export { Tokenizer } from "./src/tokenizer";
export { Parser } from "./src/parser";
export { Validator } from "./src/validator";
export { ASTOptimizer as Optimizer } from "./src/optimizer";
export { Generator } from "./src/generator";
export { Tokenizer } from "./tokenizer";
export { ASTNode } from "./ast";
export { Validator } from "./validator";
export { ASTOptimizer } from "./optimizer";
export { CodeGenerator } from "./generator";
export { Parser } from "./parser";
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
