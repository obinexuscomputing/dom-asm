import { HTMLASTNode } from "../ast/HTMLAST";
export declare class HTMLCodeGenerator {
    private selfClosingTags;
    constructor(selfClosingTags?: string[]);
    generateHTML(node: HTMLASTNode): string;
    private generateAttributes;
    private isSelfClosingTag;
}
//# sourceMappingURL=index.d.ts.map