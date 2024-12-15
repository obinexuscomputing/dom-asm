export function optimizeAST(root, automaton) {
    // Traverse the AST and update transitions based on minimized automaton
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
//# sourceMappingURL=optimizer.js.map