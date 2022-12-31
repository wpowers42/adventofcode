const fs = require('fs');
const path = require('path');

const move = (x, y, dx, dy, map) => {
    let newX = x;
    let newY = y;

    while (dx !== 0 || dy !== 0) {
        newX += dx;
        newY += dy;
        newX = newX < 0 ? map[0].length - 1 : newX > map[0].length - 1 ? 0 : newX;
        newY = newY < 0 ? map.length - 1 : newY > map.length - 1 ? 0 : newY;
        if (map[newY][newX] === '#') {
            // hit a wall
            newX = x;
            newY = y;
            dx = 0;
            dy = 0;
        } else if (map[newY][newX] === '.') {
            // move to new tile
            dx = 0;
            dy = 0;
        }
    }
    return [newX, newY];
}

const turn = (dx, dy, direction) => {
    if (direction === 'L') {
        if (dx === 1) {
            return [0, -1];
        } else if (dx === -1) {
            return [0, 1];
        } else if (dy === 1) {
            return [1, 0];
        } else if (dy === -1) {
            return [-1, 0];
        }
    } else if (direction === 'R') {
        if (dx === 1) {
            return [0, 1];
        } else if (dx === -1) {
            return [0, -1];
        } else if (dy === 1) {
            return [-1, 0];
        } else if (dy === -1) {
            return [1, 0];
        }
    }
}

const score = (x, y, dx, dy) => {
    let facingScore = dx === 1 ? 0 : dx === -1 ? 2 : dy === 1 ? 1 : 3;
    return (y + 1) * 1000 + (x + 1) * 4 + facingScore;
}

const solve = (input) => {
    let [map, instructions] = input.split('\n\n');
    map = map.split('\n').map(row => row.split(''));

    instructions = instructions.match(/\d+|[LR]/g).map(instruction => {
        if (instruction === 'L' || instruction === 'R') {
            return instruction;
        } else {
            return parseInt(instruction);
        }
    });

    let x = map[0].indexOf('.'); // start in leftmost tile
    let y = 0; // start in top row
    let dx = 1; // start facing right
    let dy = 0;

    instructions.forEach(instruction => {
        if (instruction === 'L' || instruction === 'R') {
            [dx, dy] = turn(dx, dy, instruction);
        } else {
            for (let i = 0; i < instruction; i++) {
                [x, y] = move(x, y, dx, dy, map);
            }
        }
    });

    console.log(`Part 1: ${score(x, y, dx, dy)}`);
}

const filePath = path.join(__dirname, "./input.txt");
const input = fs.readFileSync(filePath, 'utf-8');

solve(input);
