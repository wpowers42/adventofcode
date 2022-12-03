const fs = require('fs');
const path = require('path');


const convertLetterToNumber = letter => {
    if (letter !== letter.toLowerCase()) {
        return letter.charCodeAt(0) - 'A'.charCodeAt() + 27;
    } else {
        return letter.charCodeAt(0) - 'a'.charCodeAt() + 1;
    }
}


const intersection = (setA, setB) => {
    for (const element of setA.values()) {
        if (!setB.has(element)) {
            setA.delete(element);
        }
    };

    return setA;
}


const findCommonItem = (words) => {
    return (words.map(word => new Set(word))
        .reduce(intersection)
        .values().next().value);
}


const part1 = (rucksack) => {
    let compartmentA = rucksack.substr(0, rucksack.length * 0.5);
    let compartmentB = rucksack.substr(rucksack.length * 0.5);
    return convertLetterToNumber(findCommonItem([compartmentA, compartmentB]));
}


const part2 = (input) => {
    let priorityTotal = 0;
    for (let i = 0; i < input.length; i += 3) {
        priorityTotal += convertLetterToNumber(findCommonItem((input.slice(i, i + 3))));
    }
    return priorityTotal;
}


const solve = (input) => {
    input = input.split('\n');

    console.log(`Part 1: ${input.map(part1).reduce((acc, val) => acc + val)}`);
    console.log(`Part 2: ${part2(input)}`);
}


const filePath = path.join(__dirname, "./input.txt");
const data = fs.readFileSync(filePath, 'utf-8');
solve(data);
