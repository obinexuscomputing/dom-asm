import { MinimizedAutomaton } from "./StateMinimizer";

export function optimizeAST(root: ASTNode, automaton: MinimizedAutomaton): ASTNode {
    // Traverse the AST and update transitions based on minimized automaton
    const updatedNodes = new Map<string, ASTNode>();

    function traverse(node: ASTNode): ASTNode {
        if (updatedNodes.has(node.id)) return updatedNodes.get(node.id)!;

        const newNode: ASTNode = { ...node, transitions: {} };
        Object.entries(node.transitions).forEach(([input, nextNodeId]) => {
            const minimizedState = automaton.transitions[node.id]?.[input];
            if (minimizedState) {
                newNode.transitions[input] = traverse({ ...node, id: minimizedState }).id;
            }
        });
        updatedNodes.set(node.id, newNode);
        return newNode;
    }

    return traverse(root);
}

class StateMachineAST {
    private root: ASTNode;
    private automaton: MinimizedAutomaton;

    constructor(root: ASTNode, automaton: MinimizedAutomaton) {
        this.root = root;
        this.automaton = automaton;
    }

    public optimizeAST(): ASTNode {
        const updatedNodes = new Map<string, ASTNode>();

        const traverse = (node: ASTNode): ASTNode => {
            if (updatedNodes.has(node.id)) return updatedNodes.get(node.id)!;

            const newNode: ASTNode = { ...node, transitions: {} };
            Object.entries(node.transitions).forEach(([input, nextNodeId]) => {
                const minimizedState = this.automaton.transitions[node.id]?.[input];
                if (minimizedState) {
                    newNode.transitions[input] = traverse({ ...node, id: minimizedState }).id;
                }
            });
            updatedNodes.set(node.id, newNode);
            return newNode;
        };

        return traverse(this.root);
    }
}

export { StateMachineAST };