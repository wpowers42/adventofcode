const fs = require('fs');
const path = require('path');

const maxPressureSearch = (currentValue, currentValve, secondsRemaining, inactiveValves, graph) => {
    currentValue += graph.getFlowRate(currentValve) * secondsRemaining;

    const nextValves = inactiveValves.filter(inactiveValve => {
        return graph.getDistanceBetween(currentValve, inactiveValve) + 1 < secondsRemaining;
    });

    if (nextValves.length) {
        return nextValves.map(nextValve => {
            let distance = graph.getDistanceBetween(currentValve, nextValve);
            return distance < secondsRemaining - 1 ? maxPressureSearch(currentValue, nextValve, secondsRemaining - distance - 1,
                inactiveValves.filter(inactiveValve => inactiveValve !== nextValve), graph) : 0;
        }).reduce((acc, val) => Math.max(acc, val));
    } else {
        return currentValue;
    }
}


const bfs = (start, goal, graph) => {
    let queue = [start];
    let visited = new Set();
    predecessor = { start: null }

    while (queue.length) {
        let current = queue.shift();
        visited.add(current);
        if (current === goal) {
            let path = [];
            while (current) {
                path.unshift(current);
                current = predecessor[current];
            }
            return path;
        }

        for (const neighbor of graph.getNeighbors(current)) {
            if (visited.has(neighbor)) {
                continue;
            }

            visited.add(neighbor);
            queue.push(neighbor);
            predecessor[neighbor] = current;
        }

    }

    return null;

}

class Graph {
    constructor() {
        this.valves = {};
        this.cache = {};
    }

    getValvesWithFlowRate() {
        return Object.keys(this.valves).filter(valve => this.valves[valve].flowRate > 0);
    }

    getFlowRate(valve) {
        return this.valves[valve].flowRate;
    }

    getNeighbors(valve) {
        return this.valves[valve].neighbors;
    }

    addNode(valve, flowRate, neighbors) {
        this.valves[valve] = {
            flowRate: flowRate,
            neighbors: neighbors
        }
    }

    getDistanceBetween(start, goal) {
        // Check if the result is already in the cache
        if (this.cache[start] && this.cache[start][goal]) {
            return this.cache[start][goal];
        }

        // If not, compute the result and store it in the cache
        const result = bfs(start, goal, this).length - 1;
        this.cache[start] = this.cache[start] || {};
        this.cache[start][goal] = result;

        return result;
    }
}

// https://stackoverflow.com/questions/29656649/split-a-list-into-two-sublists-in-all-possible-ways
const allCombinations = (items) => {
    const flags = items.map(() => false);
    const combs = [];

    while (true) {
        const a = items.filter((_, i) => flags[i]);
        const b = items.filter((_, i) => !flags[i]);
        combs.push([a, b]);
        let i = 0;
        for (i = 0; i < items.length; i++) {
            flags[i] = !flags[i];
            if (flags[i]) {
                break;
            }
        }
        if (i === items.length) {
            break;
        }
    }

    return combs;
}

const solve = (input) => {

    const graph = new Graph();

    input.split('\n').forEach(valve => {
        const valves = valve.match(/[A-Z]{2}/g);
        const flowRate = valve.match(/\d+/g)[0];
        graph.addNode(valves[0], parseInt(flowRate), valves.splice(1))
    });

    console.log(`Part 1: ${maxPressureSearch(0, 'AA', 30, graph.getValvesWithFlowRate(), graph)}`);
    
    let part2 = allCombinations(graph.getValvesWithFlowRate()).map(valves => {
        let [a, b] = valves;
        return maxPressureSearch(0, 'AA', 26, a, graph) + maxPressureSearch(0, 'AA', 26, b, graph)
    }).reduce((acc, val) => Math.max(acc, val));

    console.log(`Part 2: ${part2}`);

}

const filePath = path.join(__dirname, "./input.txt");
const input = fs.readFileSync(filePath, 'utf-8');

solve(input);
