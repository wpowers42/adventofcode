const fs = require('fs');
const path = require('path');

const hasAdjacentElf = (x, y, positionSet) => {
    return positionSet.has(`${x},${y + 1}`) ||
        positionSet.has(`${x},${y - 1}`) ||
        positionSet.has(`${x + 1},${y}`) ||
        positionSet.has(`${x - 1},${y}`) ||
        positionSet.has(`${x - 1},${y - 1}`) ||
        positionSet.has(`${x - 1},${y + 1}`) ||
        positionSet.has(`${x + 1},${y - 1}`) ||
        positionSet.has(`${x + 1},${y + 1}`);
}

const proposeMove = (x, y, positionSet, directions) => {
    for (let j = 0; j < directions.length; j++) {
        const direction = directions[j];
        let [newX, newY] = [x, y];
        newX = direction === 'W' ? newX - 1 : direction === 'E' ? newX + 1 : newX;
        newY = direction === 'N' ? newY - 1 : direction === 'S' ? newY + 1 : newY;

        const found = positionSet.has(`${newX},${newY}`) ||
            ((direction === 'N' || direction === 'S') &&
                (positionSet.has(`${newX - 1},${newY}`) ||
                    positionSet.has(`${newX + 1},${newY}`))
            ) ||
            ((direction === 'W' || direction === 'E') &&
                (positionSet.has(`${newX},${newY - 1}`) ||
                    positionSet.has(`${newX},${newY + 1}`))
            );

        if (!found) {
            return [newX, newY];
        }
    }

    return [x, y];
}

const countEmptyGroundTiles = (positions) => {
    const [minX, maxX, minY, maxY] = positions.reduce(([minX, maxX, minY, maxY], [x, y]) => {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        return [minX, maxX, minY, maxY];
    }, [0, 0, 0, 0])

    return (maxX - minX + 1) * (maxY - minY + 1) - positions.length;
}

const spreadElves = (input, isPart2) => {
    const positions = input.split('\n').map((row, y) => row.split('')
        .map((cell, x) => cell === '#' ? [x, y] : null)
        .filter(cell => cell)).flat();

    let positionSet = new Set(positions.map(position => position.join(',')));

    const directions = ['N', 'S', 'W', 'E'];
    let round = 0;
    while (round < 10 || isPart2) {
        let idle = 0;
        const newPositions = [];
        for (let i = 0; i < positions.length; i++) {
            let [x, y] = positions[i];

            if (!hasAdjacentElf(x, y, positionSet)) {
                // no elf in range, stay put
                newPositions.push([x, y]);
                idle++;
                continue;
            }

            [x, y] = proposeMove(x, y, positionSet, directions);
            newPositions.push([x, y]);
        }

        // count the number of elves in each proposed position
        const newPositionMap = new Map();
        for (let i = 0; i < newPositions.length; i++) {
            const [x, y] = newPositions[i];
            newPositionMap.set(`${x},${y}`, (newPositionMap.get(`${x},${y}`) || 0) + 1)
        }

        // check if any proposed positions have more than one elf
        for (let i = 0; i < newPositions.length; i++) {
            const [x, y] = newPositions[i];
            const found = newPositionMap.get(`${x},${y}`) > 1;
            if (!found) {
                positions[i] = [x, y];
            }
        }

        // end of round updates
        positionSet = new Set(positions.map(position => position.join(',')));
        round += 1;
        directions.push(directions.shift()); // move first direction to the end

        // check if part 2 is done
        if (idle === positions.length) {
            return round;
        }
    }

    return countEmptyGroundTiles(positions);

}

const solve = (input) => {
    console.log(`Part 1: ${spreadElves(input, false)}`);
    console.log(`Part 2: ${spreadElves(input, true)}`);
}

const filePath = path.join(__dirname, "./input.txt");
const input = fs.readFileSync(filePath, 'utf-8');

solve(input);
