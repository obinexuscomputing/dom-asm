import { JSToken } from "src/types";
export interface JSTokenType {
    toString(): string;
    equals(other: JSTokenType): boolean;
}
/**
 * Represents a type of JavaScript token.
 * This class is used to categorize different types of tokens that can be encountered
 * during the tokenization of JavaScript code.
 *
 * @example
 * ```typescript
 * const keywordToken = JavaScriptTokenType.KEYWORD;
 * console.log(keywordToken.toString()); // Outputs: "KEYWORD"
 *
 * const identifierToken = JavaScriptTokenType.IDENTIFIER;
 * console.log(identifierToken.toString()); // Outputs: "IDENTIFIER"
 * ```
 */
export declare class JavaScriptTokenType implements JSTokenType {
    private readonly type;
    private constructor();
    static readonly KEYWORD: JavaScriptTokenType;
    static readonly IDENTIFIER: JavaScriptTokenType;
    static readonly LITERAL: JavaScriptTokenType;
    static readonly OPERATOR: JavaScriptTokenType;
    static readonly PUNCTUATOR: JavaScriptTokenType;
    static readonly COMMENT: JavaScriptTokenType;
    static readonly WHITESPACE: JavaScriptTokenType;
    static readonly TEMPLATE: JavaScriptTokenType;
    static readonly REGEXP: JavaScriptTokenType;
    toString(): string;
    equals(other: JavaScriptTokenType): boolean;
}
export declare class JavaScriptTokenValue {
    private readonly value;
    constructor(value: string);
    toString(): string;
    equals(other: JavaScriptTokenValue): boolean;
}
export declare class JavaScriptToken implements JSToken {
    private readonly type;
    private readonly value;
    constructor(type: JavaScriptTokenType, value: JavaScriptTokenValue);
    getType(): JavaScriptTokenType;
    getValue(): JavaScriptTokenValue;
    toString(): string;
    equals(other: JavaScriptToken): boolean;
    isType(type: JavaScriptTokenType): boolean;
}
export declare class JavaScriptInvalidTokenError extends Error {
    constructor(message: string);
}
//# sourceMappingURL=JavaScriptToken.d.ts.map