import { JSToken } from "../types";
import { JSASTNode } from "../types";
export declare class JSParser {
    private tokens;
    private current;
    parse(tokens: JSToken[]): JSASTNode;
    private walk;
    private parseKeyword;
    private parseVariableDeclaration;
    private parseBlockStatement;
    private parseIfStatement;
    private parseFunctionDeclaration;
}
//# sourceMappingURL=JSParser.d.ts.map