export function validateAutomaton(automaton) {
    // Check that all transitions point to valid states
    return Object.values(automaton.transitions).every(transition => Object.values(transition).every(nextState => automaton.states.includes(nextState)));
}
export function validateAST(root) {
    // Ensure all transitions in the AST are valid
    const visited = new Set();
    function traverse(node) {
        if (visited.has(node.id))
            return true;
        visited.add(node.id);
        return Object.values(node.transitions).every(nextNodeId => traverse({ ...node, id: nextNodeId }));
    }
    return traverse(root);
}
//# sourceMappingURL=index.js.map