const fs = require('fs');
const path = require('path');

class Scan {
    constructor(scan) {
        this.scan = scan.split('\n');
    }

    surfaceArea() {
        return this.scan.map(cube => 6 - this.getNeighborCount(cube, this.scan)).reduce((acc, val) => acc + val);
    }

    getAdjacentPositions(cube) {
        let [x, y, z] = cube.split(',').map(n => parseInt(n));
        let neighbors = [];

        [-1, 1].forEach(delta => {
            [0, 1, 2].forEach(coordinate => {
                let coordinates = [x, y, z];
                coordinates[coordinate] += delta;
                neighbors.push(coordinates.join(','));
            })
        });

        return neighbors;
    }

    floodFill() {
        let [minX, maxX, minY, maxY, minZ, maxZ] = [0, 0, 0, 0, 0, 0];

        this.scan.forEach(cube => {
            let [x, y, z] = cube.split(',').map(n => parseInt(n));
            minX = Math.min(minX, x - 1);
            maxX = Math.max(maxX, x + 1);
            minY = Math.min(minY, y - 1);
            maxY = Math.max(maxY, y + 1);
            minZ = Math.min(minZ, z - 1);
            maxZ = Math.max(maxZ, z + 1);
        });

        const frontier = [[minX, minY, minZ]];
        const explored = new Set();
        let collisions = 0;

        while (frontier.length) {
            let current = frontier.shift();
            explored.add(current.join(','));

            this.getAdjacentPositions(current.join(',')).forEach(neighbor => {
                let [x, y, z] = neighbor.split(',').map(n => parseInt(n));
                if (!(x < minX || x > maxX || y < minY || y > maxY || z < minZ || z > maxZ)) {
                    // is valid grid coordinate
                    if (this.scan.includes(neighbor)) {
                        // we ran into a particle side
                        collisions += 1;
                    } else if (!explored.has(neighbor)) {
                        frontier.push([x, y, z]);
                        explored.add(neighbor);
                    }
                }
            });
        }

        return collisions;
    }

    getNeighborCount(cube, pool) {

        let neighborCount = 0;
        this.getAdjacentPositions(cube).forEach(adjacentPosition => {
            neighborCount += pool.includes(adjacentPosition) ? 1 : 0;
        })

        return neighborCount;
    }

}

const solve = (input) => {
    const scan = new Scan(input);
    console.log(`Part 1: ${scan.surfaceArea()}`);
    console.log(`Part 2: ${scan.floodFill()}`);
}

const filePath = path.join(__dirname, "./input.txt");
const input = fs.readFileSync(filePath, 'utf-8');

solve(input);
