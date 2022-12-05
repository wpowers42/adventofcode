const fs = require('fs');
const path = require('path');

const part1 = (stacks, procedure) => {
    procedure.forEach(step => {
        const { crates, source, destination } = step;
        for (let i = 0; i < crates; i++) {
            // Push one crate at a time from the source stack onto the destination stack
            stacks[destination].push(stacks[source].pop());
        }
    });
    return stacks;
}

const part2 = (stacks, procedure) => {
    procedure.forEach(step => {
        const { crates, source, destination } = step;
        // Push the specified number of crates from the source stack onto the destination stack
        stacks[destination].push(...stacks[source].splice(stacks[source].length - crates, crates));
    });
    return stacks;
}

const getTopOfStacks = stacks => {
    // combine the top crate from each stack into a string
    return stacks.map(stack => stack.pop()).join('');
}

const parseInitialStack = stacksInput => {
    let stacks = [];
    stacksInput.split('\n').reverse().slice(1).forEach(row => {
        for (let i = 1; i < row.length; i += 4) {
            let column = (i - 1) / 4;
            if (!stacks[column]) {
                stacks.push([]);
            }
            if (row[i] !== ' ') {
                stacks[column].push(row[i]);
            }
        }
    });
    return stacks;
}

const parseProcedure = procedure => {
    return procedure.split('\n').map(step => {
        let [, crates, , source, , destination] = step.split(' ');
        return {
            crates: crates,
            source: source - 1, // 0-indexing
            destination: destination - 1 // 0-indexing
        }
    });
}

const solve = (input) => {
    let [stacksInput, procedureInput] = input.split('\n\n');
    const procedure = parseProcedure(procedureInput);
    const stacks = parseInitialStack(stacksInput);

    console.log(`Part 1: ${getTopOfStacks(part1(structuredClone(stacks), procedure))}`);
    console.log(`Part 2: ${getTopOfStacks(part2(structuredClone(stacks), procedure))}`);
}

const filePath = path.join(__dirname, "./input.txt");
const data = fs.readFileSync(filePath, 'utf-8');
solve(data);
