class StateMachineAST {
    constructor(root, automaton) {
        this.root = root;
        this.automaton = automaton;
    }
    optimizeAST() {
        const updatedNodes = new Map();
        const traverse = (node) => {
            if (updatedNodes.has(node.id))
                return updatedNodes.get(node.id);
            const newNode = { ...node, transitions: {} };
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
class StateMachineASTOptimizer {
    static optimizeAST(root, automaton) {
        const updatedNodes = new Map();
        function traverse(node) {
            if (updatedNodes.has(node.id))
                return updatedNodes.get(node.id);
            const newNode = { ...node, transitions: {} };
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
}
export { StateMachineAST, StateMachineASTOptimizer };
//# sourceMappingURL=StateMachineAST.js.map