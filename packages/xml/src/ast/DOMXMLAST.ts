export interface DOMXMLASTNode {
  type: 'Element' | 'Text' | 'Comment' | 'Doctype';
  name?: string;
  value?: string;
  attributes?: Record<string, string>;
  children?: DOMXMLASTNode[]; // Default will be set during processing

  // Optimization-related fields
  equivalenceClass?: number;
  optimizationData?: {
    hash: string;
    transitionSignature?: string;
    isMinimized?: boolean;
  };
}

export interface DOMXMLAST {
  root: DOMXMLASTNode;
  metadata?: {
    nodeCount: number;
    elementCount: number;
    textCount: number;
    commentCount: number;
    optimizationMetrics?: {
      originalStateCount: number;
      minimizedStateCount: number;
      reductionPercentage: number;
    };
  };
}

