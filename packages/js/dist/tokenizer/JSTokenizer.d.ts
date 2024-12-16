import { JSToken, JSTokenType } from '../types';
export declare class JSTokenizer {
    private keywords;
    private operators;
    private delimiters;
    tokenize(input: string): JSToken[];
    private matchMultiCharOperator;
}
export { JSToken, JSTokenType };
//# sourceMappingURL=JSTokenizer.d.ts.map