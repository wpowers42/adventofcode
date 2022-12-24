const fs = require('fs');
const path = require('path');

const part1 = (input) => {
    const queue = input.split('\n').map(n => n.split(': '));
    const monkeys = {};

    while (queue.length) {
        let current = queue.shift();
        if (current[1].match(/\d+/)) {
            monkeys[current[0]] = parseInt(current[1]);
        } else {
            let [a, op, b] = current[1].split(' ');
            if (monkeys[a] && monkeys[b]) {
                monkeys[current[0]] = eval(`${monkeys[a]} ${op} ${monkeys[b]}`);
            } else {
                queue.push(current);
            }
        }
    }
    return monkeys.root;
}

const binarySearch = (root) => {
    let left = 1;
    let right = Number.MAX_SAFE_INTEGER;
    const compare = eval(`${root.replace(/humn/g, left).replace(/===/g, '<')}`) ? '>' : '<';

    let mid = Math.floor((left + right) / 2);
    while (!eval(`${root.replace(/humn/g, mid)}`)) {
        if (eval(`${root.replace(/humn/g, mid).replace(/===/g, compare)}`)) {
            right = mid;
        } else {
            left = mid + 1;
        }
        mid = Math.floor((left + right) / 2);
    }

    return mid;
}

const part2 = (input) => {
    const queue = input.split('\n').map(n => n.split(': '));
    const monkeys = {};

    while (queue.length) {
        let current = queue.shift();
        if (current[0] === 'humn') {
            monkeys[current[0]] = 'humn';
        } else if (current[1].match(/\d+/)) {
            monkeys[current[0]] = parseInt(current[1]);
        } else {
            let [a, op, b] = current[1].split(' ');
            if (monkeys[a] && monkeys[b]) {
                if (a === 'humn' || b === 'humn' || monkeys[a].toString().includes('humn') || monkeys[b].toString().includes('humn')) {
                    op = current[0] === 'root' ? '===' : op; // change root op to equality check
                    monkeys[current[0]] = `(${monkeys[a]}) ${op} (${monkeys[b]})`;
                } else {
                    monkeys[current[0]] = eval(`${monkeys[a]} ${op} ${monkeys[b]}`);
                }
            } else {
                queue.push(current);
            }
        }
    }

    return binarySearch(monkeys.root);
}

const solve = (input) => {
    console.log(`Part 1: ${part1(input)}`);
    console.log(`Part 2: ${part2(input)}`);
}

const filePath = path.join(__dirname, "./input.txt");
const input = fs.readFileSync(filePath, 'utf-8');

solve(input);
