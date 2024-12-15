import { Automaton, TransitionFunction, State } from "../types";

export function minimizeAutomaton(automaton: Automaton): Automaton {
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
    const minimizedTransitions: TransitionFunction = {};

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

function initializePartitions(states: State[], acceptingStates: State[]): State[][] {
    const nonAccepting = states.filter(state => !acceptingStates.includes(state));
    return [acceptingStates, nonAccepting];
}

function splitPartitions(partitions: State[][], transitions: TransitionFunction): State[][] {
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

function findPartitionRepresentative(partitions: State[][], state: State): State {
    return partitions.find(partition => partition.includes(state))?.[0] ?? state;
}
