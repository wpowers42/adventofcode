const fs = require('fs');
const path = require('path');

class Heightmap {
    constructor(input) {
        this.start;
        this.end;
        this.elevations = this.parseInput(input);
    }

    parseInput(input) {
        return input.split('\n').map((row, y) => {
            return row.split('').map((elevation, x) => {
                if (elevation === 'S') {
                    this.start = [y, x];
                    elevation = 'a';
                } else if (elevation === 'E') {
                    this.end = [y, x];
                    elevation = 'z';
                }

                return elevation.charCodeAt() - 'a'.charCodeAt();
            });
        })
    }

    neighbors(location) {
        let [y, x] = location;
        let height = this.elevations[y][x];
        let neighbors = [[y, x - 1], [y - 1, x], [y, x + 1], [y + 1, x]].filter(neighbor => {
            let [y, x] = neighbor;
            return (x >= 0 &&
                y >= 0 &&
                x < this.elevations[0].length &&
                y < this.elevations.length &&
                this.elevations[y][x] <= height + 1);
        });
        return neighbors;
    }
}

const search = (start, end, heightmap) => {
    const frontier = [start];
    const cameFrom = {};
    cameFrom[start.join('-')] = null;

    while (frontier.length) {
        let current = frontier.shift();
        if (current.join('-') === end.join('-')) {
            // found path to end
            break;
        }
        heightmap.neighbors(current).forEach(neighbor => {
            if (!(neighbor.join('-') in cameFrom)) {
                frontier.push(neighbor);
                cameFrom[neighbor.join('-')] = current.join('-');
            }
        });
    }
    if (!(end.join('-') in cameFrom)) {
        // no valid path found
        return false;
    }
    let current = end;
    let pathLength = 0;
    while (current.join('-') !== start.join('-')) {
        pathLength += 1;
        current = cameFrom[current.join('-')].split('-');
    }
    return pathLength;
}

const solve = (input) => {
    const heightmap = new Heightmap(input);
    console.log(`Part 1: ${search(heightmap.start, heightmap.end, heightmap)}`);

    let best = heightmap.elevations.length * heightmap.elevations[0].length;
    heightmap.elevations.forEach((row, y) => {
        row.forEach((elevation, x) => {
            if (elevation === 0) {
                let steps = Math.min(best, search([y, x], heightmap.end, heightmap));
                if (steps) {
                    best = Math.min(best, steps);
                }
            }
        })
    })
    console.log(`Part 2: ${best}`);
}

const filePath = path.join(__dirname, "./input.txt");
const input = fs.readFileSync(filePath, 'utf-8');

solve(input);
