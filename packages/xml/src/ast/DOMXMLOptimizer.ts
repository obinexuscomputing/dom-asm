export interface StateNode {
  type: 'Element' | 'Text' | 'Comment' | 'Doctype';
  value?: string;
  transitions: Map<string, StateNode>;
  astChildren: Set<DOMXMLASTNode>;
  equivalenceClass: number;
}

export class DOMXMLOptimizer {
  private stateNodes: StateNode[] = [];
  private nodeMap: Map<DOMXMLASTNode, StateNode> = new Map();

  public optimize(ast: DOMXMLAST): DOMXMLAST {
    // Initialize the state machine structure
    this.initializeStructure(ast.root);

    // Build equivalence classes
    const equivalenceClasses = this.buildEquivalenceClasses();

    // Create minimized AST
    const minimizedAST = this.buildMinimizedAST(equivalenceClasses);

    // Update metadata
    minimizedAST.metadata = this.computeMetadata(minimizedAST.root);

    return minimizedAST;
  }

  private initializeStructure(node: DOMXMLASTNode): StateNode {
    if (this.nodeMap.has(node)) {
      return this.nodeMap.get(node)!;
    }

    const stateNode: StateNode = {
      type: node.type,
      value: node.value,
      transitions: new Map(),
      astChildren: new Set(),
      equivalenceClass: 0
    };

    this.nodeMap.set(node, stateNode);
    this.stateNodes.push(stateNode);

    if (node.children) {
      for (const child of node.children) {
        const childState = this.initializeStructure(child);
        stateNode.astChildren.add(child);

        if (child.type === 'Element') {
          stateNode.transitions.set(child.name!, childState);
        }
      }
    }

    return stateNode;
  }

  private buildEquivalenceClasses(): Map<number, Set<StateNode>> {
    let classes = new Map<number, Set<StateNode>>();
    let classId = 0;

    // Initial partition based on node types
    const typePartitions = new Map<string, Set<StateNode>>();
    for (const node of this.stateNodes) {
      const key = this.computeInitialSignature(node);
      if (!typePartitions.has(key)) {
        typePartitions.set(key, new Set());
      }
      typePartitions.get(key)!.add(node);
    }

    // Assign initial equivalence classes
    for (const partition of typePartitions.values()) {
      classes.set(classId, partition);
      for (const node of partition) {
        node.equivalenceClass = classId;
      }
      classId++;
    }

    // Refine partitions until no changes
    let changed = true;
    while (changed) {
      changed = false;
      const newClasses = new Map<number, Set<StateNode>>();
      let newClassId = 0;

      for (const [, partition] of classes) {
        const refinements = this.splitByTransitions(partition);
        if (refinements.size > 1) {
          changed = true;
          for (const refined of refinements.values()) {
            newClasses.set(newClassId, refined);
            for (const node of refined) {
              node.equivalenceClass = newClassId;
            }
            newClassId++;
          }
        } else {
          newClasses.set(newClassId, partition);
          for (const node of partition) {
            node.equivalenceClass = newClassId;
          }
          newClassId++;
        }
      }
      classes = newClasses;
    }

    return classes;
  }

  private computeInitialSignature(node: StateNode): string {
    return `${node.type}:${node.value || ''}:${node.transitions.size}`;
  }

  private splitByTransitions(partition: Set<StateNode>): Map<string, Set<StateNode>> {
    const splits = new Map<string, Set<StateNode>>();

    for (const node of partition) {
      const signature = this.computeTransitionSignature(node);
      if (!splits.has(signature)) {
        splits.set(signature, new Set());
      }
      splits.get(signature)!.add(node);
    }

    return splits;
  }

  private computeTransitionSignature(node: StateNode): string {
    const parts: string[] = [];

    // Add transitions
    for (const [key, target] of node.transitions) {
      parts.push(`${key}:${target.equivalenceClass}`);
    }

    // Add AST structure information
    for (const child of node.astChildren) {
      const childState = this.nodeMap.get(child);
      if (childState) {
        parts.push(`child:${childState.equivalenceClass}`);
      }
    }

    return parts.sort().join('|');
  }


  private buildMinimizedAST(classes: Map<number, Set<StateNode>>): DOMXMLAST {
    const root: DOMXMLASTNode = { type: 'Element', name: 'root', children: [] };
    const processedClasses = new Set<number>();
    const nodeClassMap = new Map<number, DOMXMLASTNode>();

    // Create minimized nodes
    for (const [classId, nodes] of classes) {
      if (processedClasses.has(classId)) continue;

      const nodesIter = nodes.values();
      const representative = nodesIter.next().value;

      if (!representative) continue; // Skip if no representative found

      const minimizedNode: DOMXMLASTNode = {
        type: representative.type,
        value: representative.value,
        children: []
      };

      if (representative.type === 'Element') {
        minimizedNode.attributes = {};
      }

      nodeClassMap.set(classId, minimizedNode);
      processedClasses.add(classId);

      if (classId === 0) { // Root class
        root.children!.push(minimizedNode);
      }
    }

    // Connect nodes based on transitions
    for (const [classId, nodes] of classes) {
      const nodesIter = nodes.values();
      const representative = nodesIter.next().value;

      if (!representative) continue;

      const currentNode = nodeClassMap.get(classId);
      if (!currentNode) continue;

      for (const [key, target] of representative.transitions) {
        const targetNode = nodeClassMap.get(target.equivalenceClass);
        if (targetNode && !currentNode.children!.includes(targetNode)) {
          currentNode.children!.push(targetNode);
        }
      }
    }

    return { root, metadata: undefined };
  }


  private computeMetadata(node: DOMXMLASTNode): DOMXMLAST['metadata'] {
    let nodeCount = 0;
    let elementCount = 0;
    let textCount = 0;
    let commentCount = 0;

    const traverse = (n: DOMXMLASTNode) => {
      nodeCount++;
      switch (n.type) {
        case 'Element': elementCount++; break;
        case 'Text': textCount++; break;
        case 'Comment': commentCount++; break;
      }
      n.children?.forEach(traverse);
    };

    traverse(node);

    return {
      nodeCount,
      elementCount,
      textCount,
      commentCount
    };
  }
}