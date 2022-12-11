const fs = require('fs');
const path = require('path');

class Monkey {
    constructor(input) {
        this.input = input;
        this.parseInput(this.input);
        this.inspections = 0;
    }

    inspect(worryLevel, monkeyMod) {
        this.inspections += 1;

        if (!monkeyMod) {
            worryLevel = Math.floor(this.operation(worryLevel) / 3); // part 1
        } else {
            worryLevel = this.operation(worryLevel) % monkeyMod; // part 2
        }
        return [worryLevel, this.test(worryLevel)];
    }

    test(worryLevel) {
        return worryLevel % this.divisor === 0 ? this.trueMonkey : this.falseMonkey;
    }

    parseInput(input) {
        let [, items, operation, divisor, trueMonkey, falseMonkey] = input.split('\n');
        this.items = items.split('Starting items: ')[1].split(', ').map(item => parseInt(item));
        this.operation = new Function('old', `return ${operation.split('new = ')[1]}`);
        this.divisor = parseInt(divisor.match(/\d+/)[0]);
        this.trueMonkey = parseInt(trueMonkey.match(/\d+/)[0]);
        this.falseMonkey = parseInt(falseMonkey.match(/\d+/)[0]);
    }
}

const monkeyBusiness = (monkeys) => {
    return monkeys.map(monkey => monkey.inspections)
        .sort((a, b) => b - a).slice(0, 2)
        .reduce((acc, val) => acc * val);
}

const part1 = (monkeys) => {
    for (let i = 0; i < 20; i++) {
        monkeys.forEach(monkey => {
            while (monkey.items.length !== 0) {
                let item = monkey.items.shift();
                let [worryLevel, targetMonkey] = monkey.inspect(item);
                monkeys[targetMonkey].items.push(worryLevel);
            }
        });
    }
    return monkeyBusiness(monkeys);
}

const part2 = (monkeys) => {
    const monkeyMod = monkeys.map(monkey => monkey.divisor).reduce((acc, val) => acc * val);
    for (let i = 0; i < 10000; i++) {
        monkeys.forEach(monkey => {
            while (monkey.items.length !== 0) {
                let item = monkey.items.shift();
                let [worryLevel, targetMonkey] = monkey.inspect(item, monkeyMod);
                monkeys[targetMonkey].items.push(worryLevel);
            }
        });
    }
    return monkeyBusiness(monkeys);
}

const parseInput = (input) => {
    let monkeys = input.split('\n\n');
    monkeys = monkeys.map(monkeyInput => new Monkey(monkeyInput));
    return monkeys;
}

const solve = (input) => {
    console.log(`Part 1: ${part1(parseInput(input))}`);
    console.log(`Part 2: ${part2(parseInput(input))}`);
}

const filePath = path.join(__dirname, "./input.txt");
const input = fs.readFileSync(filePath, 'utf-8');

solve(input);
