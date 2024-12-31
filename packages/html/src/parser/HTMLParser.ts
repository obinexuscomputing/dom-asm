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
  private currentState!: ParserState;
  private equivalenceClasses: Map<number, Set<ParserState>> = new Map();
  private optimizedStateMap: Map<ParserState, ParserState> = new Map();

  constructor() {
    this.initializeStates();
  }

  private initializeStates(): void {
    // Create initial states
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

    const inCommentState: ParserState = {
      type: 'InComment',
      isAccepting: false,
      transitions: new Map()
    };

    const inDoctypeState: ParserState = {
      type: 'InDoctype',
      isAccepting: false,
      transitions: new Map()
    };

    const finalState: ParserState = {
      type: 'Final',
      isAccepting: true,
      transitions: new Map()
    };

    // Set up transitions
    initialState.transitions.set('<', inTagState);
    initialState.transitions.set('text', inContentState);
    inTagState.transitions.set('>', inContentState);
    inTagState.transitions.set('!', inDoctypeState);
    inTagState.transitions.set('<!--', inCommentState);
    inContentState.transitions.set('<', inTagState);
    inContentState.transitions.set('EOF', finalState);
    inCommentState.transitions.set('-->', inContentState);
    inDoctypeState.transitions.set('>', inContentState);
    
    // Initialize state collections
    this.states.clear();
    this.states.add(initialState);
    this.states.add(inTagState);
    this.states.add(inContentState);
    this.states.add(inCommentState);
    this.states.add(inDoctypeState);
    this.states.add(finalState);
    
    // Set initial state
    this.currentState = initialState;
    
    // Clear and initialize maps
    this.equivalenceClasses.clear();
    this.optimizedStateMap.clear();
  }

  public parse(input: string): HTMLAST {
    const tokenizer = new HTMLTokenizer(input);
    const { tokens } = tokenizer.tokenize();
    
    this.minimizeStates();
    const ast = this.buildOptimizedAST(tokens);
    return this.optimizeAST(ast);
  }

  private minimizeStates(): void {
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
          this.handleParserError(error, currentNode);
        }
      }
    }

    return {
      root,
      metadata: this.computeOptimizedMetadata(root)
    };
  }

  private processTokenWithOptimizedState(
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
          attributes: token.attributes ?? new Map(),
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
          // Look for matching start tag in stack
          for (let i = stack.length - 1; i >= 1; i--) {
            if (stack[i].name === token.name) {
              // Pop nodes up to and including the matching tag
              currentNode = stack[i];
              stack.length = i + 1;
              return stack[i - 1]; // Return parent of matched tag
            }
          }
          // If no match found, just pop current node
          if (stack.length > 1) {
            stack.pop();
            currentNode = stack[stack.length - 1];
          }
        }
        break;
      }

      case 'Text': {
        if (token.content.trim() || token.isWhitespace) {
          const node: HTMLASTNode = {
            type: 'Text',
            value: token.content,
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
          value: token.data,
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
    this.mergeTextNodes(ast.root);
    this.removeRedundantNodes(ast.root);
    this.optimizeAttributes(ast.root);
    
    ast.metadata.minimizationMetrics = {
      originalStateCount: this.states.size,
      minimizedStateCount: this.equivalenceClasses.size,
      optimizationRatio: this.equivalenceClasses.size / this.states.size
    };
    
    return ast;
  }

  private mergeTextNodes(node: HTMLASTNode): void {
    if (!node.children.length) return;

    for (const child of node.children) {
      if (child.type === 'Element') {
        this.mergeTextNodes(child);
      }
    }

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
      const optimizedAttributes = new Map();
      for (const [key, value] of node.attributes.entries()) {
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
    console.error(`Parser error in state ${error.state.type}:`, error.message);
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