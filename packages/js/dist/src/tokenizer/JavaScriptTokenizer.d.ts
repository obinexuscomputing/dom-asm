import { JavaScriptToken, JavaScriptTokenType, JavaScriptTokenValue } from './JavaScriptToken';
export declare class JavaScriptTokenizerError extends Error {
    constructor(message: string);
}
export declare class JavaScriptTokenizer {
    private keywords;
    private operators;
    private delimiters;
    tokenize(input: string): JavaScriptToken[];
    private matchMultiCharOperator;
}
export { JavaScriptToken, JavaScriptTokenType, JavaScriptTokenValue };
//# sourceMappingURL=JavaScriptTokenizer.d.ts.map