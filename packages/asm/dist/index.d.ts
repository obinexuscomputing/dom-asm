type State = string;
interface TransitionFunction {
    [state: string]: {
        [input: string]: State;
    };
}
interface Automaton {
    states: State[];
    initialState: State;
    transitions: TransitionFunction;
    acceptingStates: State[];
}
interface ASTNode {
    id: string;
    value: string;
    transitions: {
        [input: string]: string;
    };
}
interface MinimizedAutomaton {
    states: State[];
    initialState: State;
    transitions: TransitionFunction;
    acceptingStates: State[];
}

declare function minimizeAutomaton(automaton: Automaton): Automaton;

declare function optimizeAST(root: ASTNode, automaton: MinimizedAutomaton): ASTNode;

declare function validateAutomaton(automaton: Automaton): boolean;
declare function validateAST(root: ASTNode): boolean;

export { minimizeAutomaton, optimizeAST, validateAST, validateAutomaton };
