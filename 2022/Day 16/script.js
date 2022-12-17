const fs = require('fs');
const path = require('path');

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

        for (const neighbor of graph[current].neighbors) {
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

class Path {
    constructor(path, valves) {
        this.path = path;
    }
}

const solve = (input) => {

    const graph = {}

    input.split('\n').forEach(valve => {
        const valves = valve.match(/[A-Z]{2}/g);
        const flowRate = valve.match(/\d+/g)[0];
        graph[valves[0]] = {
            flowRate: parseInt(flowRate),
            neighbors: valves.splice(1),
            paths: {}
        };
    });

    for (const start in graph) {
        for (const goal in graph) {
            graph[start].paths[goal] = bfs(start, goal, graph);
        }
    }

    console.log(graph);
    const valves = Object.keys(graph).filter(valve => graph[valve].flowRate > 0);
    console.log(valves);
    // console.log(bfs('AA', 'JJ', graph));
}


const filePath = path.join(__dirname, "./input.txt");
const input2 = fs.readFileSync(filePath, 'utf-8');
const input = `Valve AA has flow rate=0; tunnels lead to valves DD, II, BB
Valve BB has flow rate=13; tunnels lead to valves CC, AA
Valve CC has flow rate=2; tunnels lead to valves DD, BB
Valve DD has flow rate=20; tunnels lead to valves CC, AA, EE
Valve EE has flow rate=3; tunnels lead to valves FF, DD
Valve FF has flow rate=0; tunnels lead to valves EE, GG
Valve GG has flow rate=0; tunnels lead to valves FF, HH
Valve HH has flow rate=22; tunnel leads to valve GG
Valve II has flow rate=0; tunnels lead to valves AA, JJ
Valve JJ has flow rate=21; tunnel leads to valve II`;

solve(input);
