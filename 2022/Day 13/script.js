const fs = require('fs');
const path = require('path');

const parsePacket = (packet) => {
    return JSON.parse(packet);
}

const comparePackets = (left, right) => {

    while (left.length || right.length) {
        let a = left.shift();
        let b = right.shift();

        if (a === undefined) {
            return true;
        } else if (b === undefined) {
            return false;
        }

        if (typeof a === 'number' && typeof b === 'number') {
            // a & b are integers
            if (a !== b) {
                return a < b;
            }
        }

        if (typeof a === 'number' && typeof b === 'object') {
            // a is integer, b is list
            left.unshift([a]);
            right.unshift(b);
        }

        if (typeof a === 'object' && typeof b === 'number') {
            // a is list, b is integer
            left.unshift(a);
            right.unshift([b]);
        }

        if (typeof a === 'object' && typeof b === 'object') {
            // a & b are lists
            let r = comparePackets(a, b);
            if (r !== undefined) {
                return r;
            }
        }
    }
    // unclear outcome, keep going
    return undefined
}

const part1 = (distressSignal) => {
    let results = [0];
    distressSignal.forEach((packets, index) => {
        if (comparePackets(...packets.split('\n').map(packet => parsePacket(packet)))) {
            results.push(index + 1);
        };
    });
    return results.reduce((acc, val) => acc + val);
}

const part2 = (distressSignal) => {
    distressSignal = distressSignal.join('\n').split('\n').map(packet => parsePacket(packet));

    let dividerPacketA = [[2]];
    let dividerPacketB = [[6]];

    distressSignal.push(dividerPacketA);
    distressSignal.push(dividerPacketB);

    distressSignal.sort((left, right) => {
        return comparePackets(structuredClone(left), structuredClone(right)) ? -1 : 1;
    });

    let dividerPacketAIndex;
    let dividerPacketBIndex;

    distressSignal.forEach((packet, index) => {
        if (packet === dividerPacketA) {
            dividerPacketAIndex = index + 1;
        } else if (packet === dividerPacketB) {
            dividerPacketBIndex = index + 1;
        }
    });

    return dividerPacketAIndex * dividerPacketBIndex;
}

const solve = (input) => {
    let distressSignal = input.split('\n\n');
    console.log(`Part 1: ${part1(distressSignal)}`);
    console.log(`Part 2: ${part2(distressSignal)}`);
}

const filePath = path.join(__dirname, "./input.txt");
const input = fs.readFileSync(filePath, 'utf-8');

solve(input);
