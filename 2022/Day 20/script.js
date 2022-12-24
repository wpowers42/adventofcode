const fs = require('fs');
const path = require('path');

const mod = (n, m) => ((n % m) + m) % m;

const move = (list, index, move) => {
    const element = list.splice(index, 1)[0];
    let newIndex = mod(index + move, list.length);
    list.splice(newIndex, 0, element);
}

const coordinateSum = (values) => {
    const zeroIndex = values.indexOf(0);
    const indices = [1000, 2000, 3000];
    return indices.map(i => values[mod(zeroIndex + i, values.length)])
                  .reduce((a, b) => a + b);
}

const mix = (input, decryptionKey = 1, mixIterations = 1) => {
    const values = input.split('\n').map(n => parseInt(n) * decryptionKey);
    const indices = values.map((_, index) => index);
    for (let j = 0; j < mixIterations; j++) {
        for (let i = 0; i < values.length; i++) {
            let index = indices.indexOf(i);
            let steps = values[index];
            move(indices, index, steps);
            move(values, index, steps);
        }
    }
    return coordinateSum(values);
}

const solve = (input) => {
    console.log(`Part 1: ${mix(input)}`);
    console.log(`Part 2: ${mix(input, 811589153, 10)}`);
}

const filePath = path.join(__dirname, "./input.txt");
const input = fs.readFileSync(filePath, 'utf-8');

solve(input);
