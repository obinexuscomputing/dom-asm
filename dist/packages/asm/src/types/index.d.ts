export type State = string;
export type InputSymbol = string;
export interface TransitionFunction {
    [state: string]: {
        [input: string]: State;
    };
}
export interface Automaton {
    states: State[];
    initialState: State;
    transitions: TransitionFunction;
    acceptingStates: State[];
}
export interface ASTNode {
    id: string;
    value: string;
    transitions: {
        [input: string]: string;
    };
}
export interface MinimizedAutomaton {
    states: State[];
    initialState: State;
    transitions: TransitionFunction;
    acceptingStates: State[];
}
