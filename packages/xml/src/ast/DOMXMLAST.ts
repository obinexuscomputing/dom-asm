export interface DOMXMLASTNode {
    type: "Element" | "Text" | "Comment" | "Doctype";
    name?: string; // For "Element" nodes
    value?: string; // For "Text", "Comment", or "Doctype" nodes
    attributes?: Record<string, string>; // For "Element" nodes
    children?: DOMXMLASTNode[]; // For "Element" nodes
  }
  
  export interface DOMXMLAST {
    root: DOMXMLASTNode; // Root node of the AST
    metadata?: {
      nodeCount: number;
      elementCount: number;
      textCount: number;
      commentCount: number;
    };
  }
  