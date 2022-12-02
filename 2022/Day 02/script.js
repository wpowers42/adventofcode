const fs = require('fs');
const path = require('path');


// TIL % means remainder in JS not modulo
const mod = (n, m) => ((n % m) + m) % m;

const scoreRoundOutcome = (a, b) => {
    // Return round outcome points for b
    return a === b ? 3 : mod(a, 3) + 1 === b ? 6 : 0;
}

const symbolMap = { 'A': 1, 'B': 2, 'C': 3, 'X': 1, 'Y': 2, 'Z': 3 };

const score = (strategy, part) => {
    let [a, b] = strategy.split(' ');
    a = symbolMap[a];
    b = symbolMap[b];

    if (part === 2) {
        let c = b - 2; // L: -1, T: 0, W: +1
        b = mod(a + c - 1, 3) + 1; // Move c shapes away from a, wrapping around if needed
    }

    return b + scoreRoundOutcome(a, b);
}

const solve = (input) => {
    console.log(input.split('\n').map((strategy) => score(strategy, 1)).reduce((acc, val) => acc + val));
    console.log(input.split('\n').map((strategy) => score(strategy, 2)).reduce((acc, val) => acc + val));
}

const filePath = path.join(__dirname, "./input.txt");
const data = fs.readFileSync(filePath, 'utf-8');
solve(data);
