// Enhanced HTML Parser incorporating state minimization and AST optimization
import { HTMLToken, HTMLTokenizer } from '../tokenizer/HTMLTokenizer';

// State representation following the 5-tuple automaton definition (Q, Σ, δ, q0, F)
interface ParserState {
  type: 'Initial' | 'InTag' | 'InContent' | 'InComment' | 'InDoctype' | 'Final';
  isAccepting: boolean;
  transitions: Map<string, ParserState>;
}

// Refined HTML AST Node Types following optimized structure
export interface HTMLASTNode {
  type: 'Element' | 'Text' | 'Comment' | 'Doctype';
  name?: string;
  value?: string;
  attributes?: Map<string, string>;
  children: HTMLASTNode[];
  metadata: {
    equivalenceClass: number;  // For state minimization
    isMinimized: boolean;     // Tracks optimization status
  };
}

export interface HTMLAST {
  root: HTMLASTNode;
  metadata: {
    nodeCount: number;
    elementCount: number;
    textCount: number;
    commentCount: number;
    minimizationMetrics?: {
      originalStateCount: number;
      minimizedStateCount: number;
      optimizationRatio: number;
    };
  };
}

export class HTMLParserError extends Error {
  constructor(
    message: string,
    public token: HTMLToken,
    public state: ParserState,
    public position: number
  ) {
    super(`${message} at position ${position}`);
    this.name = 'HTMLParserError';
  }
}

export class HTMLParser {
  private states: Set<ParserState> = new Set();
  private currentState: ParserState = {} as ParserState;
  private equivalenceClasses: Map<number, Set<ParserState>> = new Map();
  private optimizedStateMap: Map<ParserState, ParserState> = new Map();

  constructor() {
    this.initializeStates();
  }

  private initializeStates(): void {
    // Initialize state machine following automaton definition
    const initialState: ParserState = {
      type: 'Initial',
      isAccepting: false,
      transitions: new Map()
    };

    const inTagState: ParserState = {
      type: 'InTag',
      isAccepting: false,
      transitions: new Map()
    };

    const inContentState: ParserState = {
      type: 'InContent',
      isAccepting: true,
      transitions: new Map()
    };

    // Set up transitions according to HTML parsing rules
    initialState.transitions.set('<', inTagState);
    initialState.transitions.set('text', inContentState);
    
    this.states = new Set([initialState, inTagState, inContentState]);
    this.currentState = initialState;
    this.equivalenceClasses = new Map();
    this.optimizedStateMap = new Map();
  }

  // State minimization following Hopcroft's algorithm as described in papers
  private minimizeStates(): void {
    // Initial partition: accepting vs non-accepting states
    const accepting = new Set([...this.states].filter(s => s.isAccepting));
    const nonAccepting = new Set([...this.states].filter(s => !s.isAccepting));
    
    let partition = [accepting, nonAccepting];
    let newPartition: Set<ParserState>[] = [];
    
    do {
      partition = newPartition.length > 0 ? newPartition : partition;
      newPartition = [];
      
      for (const block of partition) {
        const splits = this.splitBlock(block, partition);
        newPartition.push(...splits);
      }
    } while (newPartition.length !== partition.length);
    
    // Update equivalence classes
    partition.forEach((block, index) => {
      this.equivalenceClasses.set(index, block);
    });
  }

  private splitBlock(block: Set<ParserState>, partition: Set<ParserState>[]): Set<ParserState>[] {
    if (block.size <= 1) return [block];
    
    const splits = new Map<string, Set<ParserState>>();
    
    for (const state of block) {
      const signature = this.getStateSignature(state, partition);
      if (!splits.has(signature)) {
        splits.set(signature, new Set());
      }
      splits.get(signature)!.add(state);
    }
    
    return Array.from(splits.values());
  }

  private getStateSignature(state: ParserState, partition: Set<ParserState>[]): string {
    const transitions: string[] = [];
    
    for (const [symbol, targetState] of state.transitions) {
      const targetPartition = partition.findIndex(block => block.has(targetState));
      transitions.push(`${symbol}:${targetPartition}`);
    }
    
    return transitions.sort().join('|');
  }

  // Main parsing method incorporating optimizations
  public parse(input: string): HTMLAST {
    const tokenizer = new HTMLTokenizer(input);
    const { tokens } = tokenizer.tokenize();
    
    // Minimize states before parsing
    this.minimizeStates();
    
    const ast = this.buildOptimizedAST(tokens);
    return this.optimizeAST(ast);
  }

  private buildOptimizedAST(tokens: HTMLToken[]): HTMLAST {
    const root: HTMLASTNode = {
      type: 'Element',
      name: 'root',
      children: [],
      metadata: {
        equivalenceClass: 0,
        isMinimized: false
      }
    };

    const stack: HTMLASTNode[] = [root];
    let currentNode = root;
    
    for (const token of tokens) {
      try {
        currentNode = this.processTokenWithOptimizedState(token, currentNode, stack);
      } catch (error) {
        if (error instanceof HTMLParserError) {
          // Handle error according to current state
          this.handleParserError(error, currentNode);
        }
        throw error;
      }
    }

    return {
      root,
      metadata: this.computeOptimizedMetadata(root)
    };
  }private processTokenWithOptimizedState(
    token: HTMLToken,
    currentNode: HTMLASTNode,
    stack: HTMLASTNode[]
): HTMLASTNode {
    const optimizedState = this.optimizedStateMap.get(this.currentState) || this.currentState;
    
    switch (token.type) {
        case 'StartTag': {
            const element: HTMLASTNode = {
                type: 'Element',
                name: token.name,
                attributes: token.attributes, // Already a Map
                children: [],
                metadata: {
                    equivalenceClass: this.getEquivalenceClass(optimizedState),
                    isMinimized: true
                }
            };
            
            currentNode.children.push(element);
            if (!token.selfClosing) {
                stack.push(element);
                currentNode = element;
            }
            break;
        }

        case 'EndTag': {
            if (stack.length > 1) {
                const lastElement = stack[stack.length - 1];
                if (lastElement.name === token.name) {
                    stack.pop();
                    currentNode = stack[stack.length - 1];
                }
            }
            break;
        }

        case 'Text': {
            // Only add non-empty text nodes
            if (token.value.trim() || token.isWhitespace) {
                const node: HTMLASTNode = {
                    type: 'Text',
                    value: token.value,
                    children: [],
                    metadata: {
                        equivalenceClass: this.getEquivalenceClass(optimizedState),
                        isMinimized: true
                    }
                };
                currentNode.children.push(node);
            }
            break;
        }

        case 'Comment': {
            const node: HTMLASTNode = {
                type: 'Comment',
                value: token.value,
                children: [],
                metadata: {
                    equivalenceClass: this.getEquivalenceClass(optimizedState),
                    isMinimized: true
                }
            };
            currentNode.children.push(node);
            break;
        }
    }

    return currentNode;
}

  private optimizeAST(ast: HTMLAST): HTMLAST {
    // Apply AST optimizations based on paper recommendations
    this.mergeTextNodes(ast.root);
    this.removeRedundantNodes(ast.root);
    this.optimizeAttributes(ast.root);
    
    // Update metadata with optimization metrics
    ast.metadata.minimizationMetrics = {
      originalStateCount: this.states.size,
      minimizedStateCount: this.equivalenceClasses.size,
      optimizationRatio: this.equivalenceClasses.size / this.states.size
    };
    
    return ast;
  }
  private mergeTextNodes(node: HTMLASTNode): void {
    if (!node.children.length) return;

    // First, merge text nodes in children
    for (const child of node.children) {
        if (child.type === 'Element') {
            this.mergeTextNodes(child);
        }
    }

    // Then merge consecutive text nodes at current level
    let i = 0;
    while (i < node.children.length - 1) {
        const current = node.children[i];
        const next = node.children[i + 1];
        
        if (current.type === 'Text' && next.type === 'Text') {
            current.value = (current.value || '') + (next.value || '');
            node.children.splice(i + 1, 1);
        } else {
            i++;
        }
    }
}


  private removeRedundantNodes(node: HTMLASTNode): void {
    node.children = node.children.filter(child => {
      if (child.type === 'Text') {
        return child.value && child.value.trim().length > 0;
      }
      this.removeRedundantNodes(child);
      return true;
    });
  }

  private optimizeAttributes(node: HTMLASTNode): void {
    if (node.attributes) {
      // Convert attributes to Map for efficient lookup and modification
      const optimizedAttributes = new Map();
      for (const [key, value] of node.attributes.entries()) {
        // Normalize attribute names and values
        const normalizedKey = key.toLowerCase();
        optimizedAttributes.set(normalizedKey, value);
      }
      node.attributes = optimizedAttributes;
    }
    
    node.children.forEach(child => this.optimizeAttributes(child));
  }

  private getEquivalenceClass(state: ParserState): number {
    for (const [classId, states] of this.equivalenceClasses) {
      if (states.has(state)) return classId;
    }
    return -1;
  }

  private handleParserError(error: HTMLParserError, currentNode: HTMLASTNode): void {
    // Implement error recovery based on current state and node context
    console.error(`Parser error in state ${error.state.type}:`, error.message);
    // Additional error handling logic can be added here
  }

  private computeOptimizedMetadata(root: HTMLASTNode): HTMLAST['metadata'] {
    const metadata = {
      nodeCount: 0,
      elementCount: 0,
      textCount: 0,
      commentCount: 0
    };

    const countNodes = (node: HTMLASTNode): void => {
      metadata.nodeCount++;
      switch (node.type) {
        case 'Element':
          metadata.elementCount++;
          break;
        case 'Text':
          metadata.textCount++;
          break;
        case 'Comment':
          metadata.commentCount++;
          break;
      }
      node.children.forEach(countNodes);
    };

    countNodes(root);
    return metadata;
  }
}