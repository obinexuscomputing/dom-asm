export interface HTMLASTNode {
  type: "Element" | "Text" | "Comment";
  name?: string; // For "Element" nodes
  value?: string; // For "Text" or "Comment" nodes
  attributes?: Record<string, string>; // For "Element" nodes
  children?: HTMLASTNode[]; // For "Element" nodes
}


export interface HTMLAST {
  root: HTMLASTNode; // Root node of the AST
  metadata?: {
    nodeCount: number; // Total number of nodes in the AST
    elementCount: number; // Count of "Element" nodes
    textCount: number; // Count of "Text" nodes
    commentCount: number; // Count of "Comment" nodes
  };
}
