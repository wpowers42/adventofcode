const path = require('path');

const { readFile } = require('../../utils');

const solve = (input) => {
    let totals = [];
    let currentTotal = 0;

    input.split('\n').forEach(item => {
        if (item === '') {
            totals.push(currentTotal);
            currentTotal = 0;
        } else {
            currentTotal += parseInt(item);
        }
    });;
    totals.sort((a, b) => b - a);
    console.log(`Part 1: ${totals.slice(0, 1)}`);
    console.log(`Part 2: ${totals.slice(0, 3).reduce((acc, val) => acc + val)}`);
}

const filePath = path.join(__dirname, "./input.txt")
readFile(filePath, solve);
