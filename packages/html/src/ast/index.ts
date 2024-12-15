export interface HTMLASTNode {
  type: "Element" | "Text" | "Comment";
  name?: string; // Only for type 'Element'
  value?: string; // Only for type 'Text' or 'Comment'
  attributes?: Record<string, string>; // Only for type 'Element'
  children?: HTMLASTNode[]; // Only for type 'Element'
}
