export class StateMinimizer {
    constructor(automaton) {
        this.automaton = automaton;
    }
    /**
     * Minimizes the given automaton using state minimization algorithm.
     * @returns The minimized automaton.
     */
    minimize() {
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
        const minimizedTransitions = {};
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
    initializePartitions(states, acceptingStates) {
        const nonAcceptingStates = states.filter(state => !acceptingStates.includes(state));
        return [acceptingStates, nonAcceptingStates];
    }
    /**
     * Splits the partitions based on the transition function.
     * @param partitions The current partitions of states.
     * @param transitions The transition function of the automaton.
     * @returns The new partitions after splitting.
     */
    splitPartitions(partitions, transitions) {
        const newPartitions = [];
        partitions.forEach(partition => {
            const splitMap = {};
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
    findPartitionRepresentative(partitions, state) {
        return partitions.find(partition => partition.includes(state))?.[0] ?? state;
    }
}
//# sourceMappingURL=StateMinimizer.js.map