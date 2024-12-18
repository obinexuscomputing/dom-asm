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
export interface MinimizedAutomaton {
    states: State[];
    initialState: State;
    transitions: TransitionFunction;
    acceptingStates: State[];
}
export declare class StateMinimizer {
    private automaton;
    constructor(automaton: Automaton);
    /**
     * Minimizes the given automaton using state minimization algorithm.
     * @returns The minimized automaton.
     */
    minimize(): MinimizedAutomaton;
    /**
     * Initializes the partitions of states into accepting and non-accepting states.
     * @param states All states of the automaton.
     * @param acceptingStates The accepting states of the automaton.
     * @returns The initial partitions of states.
     */
    private initializePartitions;
    /**
     * Splits the partitions based on the transition function.
     * @param partitions The current partitions of states.
     * @param transitions The transition function of the automaton.
     * @returns The new partitions after splitting.
     */
    private splitPartitions;
    /**
     * Finds the representative state of the partition that contains the given state.
     * @param partitions The partitions of states.
     * @param state The state to find the representative for.
     * @returns The representative state of the partition.
     */
    private findPartitionRepresentative;
}
//# sourceMappingURL=StateMinimizer.d.ts.map