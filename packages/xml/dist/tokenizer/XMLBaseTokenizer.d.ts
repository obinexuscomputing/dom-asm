export declare abstract class XMLBaseTokenizer {
    protected input: string;
    protected position: number;
    protected line: number;
    protected column: number;
    protected type: string | undefined;
    constructor(input: string);
    abstract tokenize(): unknown[];
    protected peek(offset?: number): string;
    protected consume(): string;
    protected readUntil(stop: string | RegExp): string;
    protected skipWhitespace(): void;
    protected getCurrentLocation(): {
        line: number;
        column: number;
    };
}
//# sourceMappingURL=XMLBaseTokenizer.d.ts.map