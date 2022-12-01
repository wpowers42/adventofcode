fs = require('fs');

fs.readFile('2022/Day 01/input.txt', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  solve(data);
});

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
    totals.sort((a,b) => b - a);
    console.log(`Part 1: ${totals.slice(0,1)}`);
    console.log(`Part 2: ${totals.slice(0,3).reduce((acc, val) => acc + val)}`);
}
