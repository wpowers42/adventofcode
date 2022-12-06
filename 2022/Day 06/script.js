const fs = require('fs');
const path = require('path');


const detectMarkerStart = (input, startOfPacketLength) => {
    let marker = [];
    for (let i = 0; i < input.length; i++) {
        if (marker.includes(input[i])) {
            // If marker includes current character, remove it and preceding
            // elements before adding this instance of the character.
            marker = marker.slice(marker.indexOf(input[i]) + 1);
        }
        marker.push(input[i]);

        if (marker.length === startOfPacketLength) {
            return i + 1;
        }
    }
}

const solve = (input) => {
    console.log(`Part 1: ${detectMarkerStart(input, 4)}`);
    console.log(`Part 2: ${detectMarkerStart(input, 14)}`);
}

const filePath = path.join(__dirname, "./input.txt");
const data = fs.readFileSync(filePath, 'utf-8');
solve(data);
