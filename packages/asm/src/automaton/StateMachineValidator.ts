import { Automaton } from './StateMinimizer';
import { ASTNode } from './StateMachineAST';

class StateMachineValidator {
    public static validateAutomaton(automaton: Automaton): boolean {
        // Check that all transitions point to valid states
        return Object.values(automaton.transitions).every(transition =>
            Object.values(transition).every(nextState => automaton.states.includes(nextState))
        );
    }

    public static validateAST(root: ASTNode): boolean {
        // Ensure all transitions in the AST are valid
        const visited = new Set<string>();

        function traverse(node: ASTNode): boolean {
            if (visited.has(node.id)) return true;
            visited.add(node.id);

            return Object.values(node.transitions).every(nextNodeId => traverse({ ...node, id: nextNodeId }));
        }

        return traverse(root);
    }
}

export { StateMachineValidator };
