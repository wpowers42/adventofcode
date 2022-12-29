const fs = require('fs');
const path = require('path');

const mod = (n, m) => ((n % m) + m) % m;

const parseMap = (map) => {
    map = map.split('\n').map(row => row.split(''));
    const blizzards = {};
    for (let y = 1; y < map.length - 1; y++) {
        for (let x = 1; x < map[0].length - 1; x++) {
            let worldX = x - 1;
            let worldY = y - 1;
            if (map[y][x] === '>') {
                blizzards[[worldX, worldY]] = [1, 0];
            } else if (map[y][x] === '<') {
                blizzards[[worldX, worldY]] = [-1, 0];
            } else if (map[y][x] === 'v') {
                blizzards[[worldX, worldY]] = [0, 1];
            } else if (map[y][x] === '^') {
                blizzards[[worldX, worldY]] = [0, -1];
            }
        }
    }

    return [blizzards, map[0].length - 2, map.length - 2];
}

const isAccessible = (x, y, blizzards, minute, width, height) => {
    if ((x === 0 && y === -1) || (x === width - 1 && y === height)) {
        return true;
    }

    if (x < 0 || x >= width || y < 0 || y >= height) {
        return false;
    }

    for (const [blizzard, [dx, dy]] of Object.entries(blizzards)) {
        const [blizzardX, blizzardY] = blizzard.split(',').map(Number);
        const newX = mod(blizzardX + dx * minute, width);
        const newY = mod(blizzardY + dy * minute, height);
        if (newX === x && newY === y) {
            return false;
        }
    }

    return true;
}

const getNeighbors = (node, blizzards, minute, width, height) => {
    const [x, y] = node.split(',').map(Number);
    const neighbors = [];
    if (isAccessible(x, y, blizzards, minute, width, height)) {
        neighbors.push(`${x},${y},${minute}`);
    }
    if (isAccessible(x, y - 1, blizzards, minute, width, height)) {
        neighbors.push(`${x},${y - 1},${minute}`);
    }
    if (isAccessible(x, y + 1, blizzards, minute, width, height)) {
        neighbors.push(`${x},${y + 1},${minute}`);
    }
    if (isAccessible(x - 1, y, blizzards, minute, width, height)) {
        neighbors.push(`${x - 1},${y},${minute}`);
    }
    if (isAccessible(x + 1, y, blizzards, minute, width, height)) {
        neighbors.push(`${x + 1},${y},${minute}`);
    }
    return neighbors;
}

const heuristic = (startNode, goalNode) => {
    const [startX, startY] = startNode.split(',').map(Number);
    const [goalX, goalY] = goalNode.split(',').map(Number);
    return Math.abs(goalX - startX) + Math.abs(goalY - startY);
}

function aStar(startNode, goalNode, startCost, blizzards, width, height) {
    const openList = new Set(); // to be explored
    const closedList = new Set(); // already explored

    const gScore = new Map(); // cost of reaching each node from the start
    const fScore = new Map(); // estiamted cost to reach goal from node
    const cameFrom = new Map(); // store previous node of each node in path

    openList.add(startNode);
    gScore.set(startNode, startCost);  // The cost of reaching the start node
    fScore.set(startNode, heuristic(startNode, goalNode));  // Initialize the fScore of the start node

    while (openList.size > 0) {
        // Find the node with the lowest fScore in the open list
        let currentNode = null;
        let currentFScore = Infinity;
        for (const node of openList) {
            if (fScore.get(node) < currentFScore) {
                currentNode = node;
                currentFScore = fScore.get(node);
            }
        }


        if (currentNode.split(',').slice(0,2).join(',') === goalNode) {
            return gScore.get(currentNode);
        }

        // Remove the current node from the open list and add it to the closed list
        openList.delete(currentNode);
        closedList.add(currentNode);

        // Expand the current node by adding its neighbors to the open list
        for (const neighbor of getNeighbors(currentNode, blizzards, gScore.get(currentNode) + 1, width, height)) {
            // Skip neighbors that are already in the closed list
            if (closedList.has(neighbor)) {
                continue;
            }

            // Calculate the cost of reaching this neighbor from the start
            const tentativeGScore = gScore.get(currentNode) + 1;

            // If the neighbor is not in the open list, or if this path to the neighbor is better than the previous one, update the cost and cameFrom map
            if (!openList.has(neighbor) || tentativeGScore < gScore.get(neighbor)) {
                cameFrom.set(neighbor, currentNode);
                gScore.set(neighbor, tentativeGScore);
                fScore.set(neighbor, gScore.get(neighbor) + heuristic(neighbor, goalNode));
                if (!openList.has(neighbor)) {
                    openList.add(neighbor);
                }
            }

        }
    }

    // The search was unsuccessful
    return null;
}


const solve = (input) => {
    const [blizzards, width, height] = parseMap(input);
    // Part 1: 257 steps
    const part1 = aStar('0,-1', `${width - 1},${height}`, 0, blizzards, width, height);
    console.log(`Part 1: ${part1}`);

    // Part 2A: 564 steps total
    const part2A = aStar(`${width - 1},${height}`, '0,-1', part1, blizzards, width, height);

    // Part 2B: 828 steps total
    const part2B = aStar('0,-1', `${width - 1},${height}`, part2A, blizzards, width, height);
    console.log(`Part 2: ${part2B}`);
}

const filePath = path.join(__dirname, "./input.txt");
const input = fs.readFileSync(filePath, 'utf-8');

solve(input);
