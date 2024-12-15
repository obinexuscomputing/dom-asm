export declare abstract class XMLBaseTokenizer {
    protected input: string;
    protected position: number;
    protected line: number;
    protected column: number;
    protected type: string | undefined;
    constructor(input: string);
    abstract tokenize(): unknown[];
    protected peek(offset?: number): string;
    protected peekSequence(length: number): string;
    protected matches(str: string): boolean;
    protected consume(): string;
    protected consumeSequence(length: number): string;
    protected readUntil(stop: string | RegExp, options?: {
        escape?: boolean;
        includeStop?: boolean;
        skipStop?: boolean;
    }): string;
    protected readWhile(predicate: (char: string, index: number) => boolean): string;
    protected skipWhitespace(): void;
    protected getCurrentLocation(): {
        line: number;
        column: number;
    };
    protected isNameChar(char: string): boolean;
    protected isIdentifierStart(char: string): boolean;
    protected isIdentifierPart(char: string): boolean;
    protected readIdentifier(): string;
    protected readQuotedString(): string;
    protected hasMore(): boolean;
    protected addError(message: string): void;
    protected saveState(): {
        position: number;
        line: number;
        column: number;
    };
    protected restoreState(state: {
        position: number;
        line: number;
        column: number;
    }): void;
}
//# sourceMappingURL=XMLBaseTokenizer.d.ts.map