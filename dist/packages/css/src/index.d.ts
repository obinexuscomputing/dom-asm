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
