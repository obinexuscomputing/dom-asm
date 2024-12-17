export interface DOMXMLMetadata {
    nodeCount: number;
    elementCount: number;
    textCount: number;
    commentCount: number;
}
export interface DOMXMLASTNode {
    type: "Element" | "Text" | "Comment" | "Doctype";
    name?: string;
    value?: string;
    attributes?: Record<string, string>;
    children?: DOMXMLASTNode[];
}
export declare class DOMXMLAST {
    root: DOMXMLASTNode;
    metadata: DOMXMLMetadata;
    constructor(root: DOMXMLASTNode, metadata: DOMXMLMetadata);
    computeMetadata(): DOMXMLMetadata;
    addChildNode(parent: DOMXMLASTNode, child: DOMXMLASTNode): void;
    removeChildNode(parent: DOMXMLASTNode, child: DOMXMLASTNode): void;
}
