export function minimizeAutomaton(automaton) {
    const { states, transitions, initialState, acceptingStates } = automaton;
    // Step 1: Partition states into equivalence classes
    let partitions = initializePartitions(states, acceptingStates);
    let changed = true;
    while (changed) {
        changed = false;
        partitions = splitPartitions(partitions, transitions);
    }
    // Step 2: Build minimized automaton
    const minimizedStates = partitions.map(partition => partition[0]); // Representative states
    const minimizedTransitions = {};
    minimizedStates.forEach(state => {
        minimizedTransitions[state] = {};
        Object.entries(transitions[state]).forEach(([input, nextState]) => {
            minimizedTransitions[state][input] = findPartitionRepresentative(partitions, nextState);
        });
    });
    return {
        states: minimizedStates,
        transitions: minimizedTransitions,
        initialState: findPartitionRepresentative(partitions, initialState),
        acceptingStates: acceptingStates.filter(state => minimizedStates.includes(state)),
    };
}
function initializePartitions(states, acceptingStates) {
    const nonAccepting = states.filter(state => !acceptingStates.includes(state));
    return [acceptingStates, nonAccepting];
}
function splitPartitions(partitions, transitions) {
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
function findPartitionRepresentative(partitions, state) {
    return partitions.find(partition => partition.includes(state))?.[0] ?? state;
}
//# sourceMappingURL=stateMinimizers.js.map