// Automaton-related types
export type State = string; // States represented as strings
export type InputSymbol = string; // Input symbols for transitions

export interface TransitionFunction {
    [state: string]: {
        [input: string]: State; // Maps input symbols to next states
    };
}

export interface Automaton {
    states: State[]; // Set of all states
    initialState: State; // Initial state of the automaton
    transitions: TransitionFunction; // Transition function
    acceptingStates: State[]; // Set of accepting (final) states
}

export interface MinimizedAutomaton {
    states: State[]; // Minimized set of states
    initialState: State; // Initial state of the minimized automaton
    transitions: TransitionFunction; // Minimized transition function
    acceptingStates: State[]; // Minimized set of accepting states
}

export class StateMinimizer {
    private automaton: Automaton;

    constructor(automaton: Automaton) {
        this.automaton = automaton;
    }

    /**
     * Minimizes the given automaton using state minimization algorithm.
     * @returns The minimized automaton.
     */
    public minimize(): MinimizedAutomaton {
        const { states, transitions, initialState, acceptingStates } = this.automaton;

        // Step 1: Partition states into equivalence classes
        let partitions = this.initializePartitions(states, acceptingStates);

        let partitionsChanged = true;
        while (partitionsChanged) {
            partitionsChanged = false;
            const newPartitions = this.splitPartitions(partitions, transitions);
            if (newPartitions.length !== partitions.length) {
                partitionsChanged = true;
            }
            partitions = newPartitions;
        }

        // Step 2: Build minimized automaton
        const minimizedStates = partitions.map(partition => partition[0]); // Representative states
        const minimizedTransitions: TransitionFunction = {};

        minimizedStates.forEach(state => {
            minimizedTransitions[state] = {};
            Object.entries(transitions[state]).forEach(([input, nextState]) => {
                minimizedTransitions[state][input] = this.findPartitionRepresentative(partitions, nextState);
            });
        });

        return {
            states: minimizedStates,
            transitions: minimizedTransitions,
            initialState: this.findPartitionRepresentative(partitions, initialState),
            acceptingStates: acceptingStates.filter(state => minimizedStates.includes(state)),
        };
    }

    /**
     * Initializes the partitions of states into accepting and non-accepting states.
     * @param states All states of the automaton.
     * @param acceptingStates The accepting states of the automaton.
     * @returns The initial partitions of states.
     */
    private initializePartitions(states: State[], acceptingStates: State[]): State[][] {
        const nonAcceptingStates = states.filter(state => !acceptingStates.includes(state));
        return [acceptingStates, nonAcceptingStates];
    }

    /**
     * Splits the partitions based on the transition function.
     * @param partitions The current partitions of states.
     * @param transitions The transition function of the automaton.
     * @returns The new partitions after splitting.
     */
    private splitPartitions(partitions: State[][], transitions: TransitionFunction): State[][] {
        const newPartitions: State[][] = [];
        partitions.forEach(partition => {
            const splitMap: Record<string, State[]> = {};
            partition.forEach(state => {
                const signature = JSON.stringify(transitions[state]);
                if (!splitMap[signature]) {
                    splitMap[signature] = [];
                }
                splitMap[signature].push(state);
            });
            newPartitions.push(...Object.values(splitMap));
        });
        return newPartitions;
    }

    /**
     * Finds the representative state of the partition that contains the given state.
     * @param partitions The partitions of states.
     * @param state The state to find the representative for.
     * @returns The representative state of the partition.
     */
    private findPartitionRepresentative(partitions: State[][], state: State): State {
        return partitions.find(partition => partition.includes(state))?.[0] ?? state;
    }
}
