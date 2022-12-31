const fs = require('fs');
const path = require('path');

const snafuToDecimal = (snafu) => {
    let total = 0;
    for (let i = 0; i < snafu.length; i++) {
        let digit = snafu[i] === '-' ? -1 : snafu[i] === '=' ? -2 : parseInt(snafu[i]);
        total += digit * Math.pow(5, (snafu.length - i - 1));
    }
    return total;
}

function decimalToSnafu(num) {
    let result = [];
    while (num > 0) {
        result.push(num % 5);
        num = Math.floor(num / 5);
    }
    result.push(0);
    for (let i = 0; i < result.length; i++) {
        if (result[i] > 2) {
            result[i] = result[i] % 3 - 2;
            result[i + 1]++;
        }
    }
    result = result.map(digit => digit === -1 ? '-' : digit === -2 ? '=' : digit).reverse().join('');
    if (result[0] === '0') {
        result = result.substring(1);
    }

    return result;
}

const solve = (input) => {
    let part1 = input.split('\n').map(snafuToDecimal).reduce((a, c) => a + c);
    console.log(`Part 1: ${decimalToSnafu(part1)}`);
}

const filePath = path.join(__dirname, "./input.txt");
const input = fs.readFileSync(filePath, 'utf-8');
const test = `1=-0-2
12111
2=0=
21
2=01
111
20012
112
1=-1=
1-12
12
1=
122`;

solve(test);
