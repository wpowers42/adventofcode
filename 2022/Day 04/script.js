const fs = require('fs');
const path = require('path');

const isContainedPair = pair => {
    /* 
    A Pair is contained if one of the ranges fully resides within the other.
    Range A is contained in Range B if Min(A) >= Min(B) && Max(A) <= Max(B)
    */
    let [A, B] = (pair.split(',').map(range => range.split('-')
                                 .map(section => parseInt(section))));
    return ((A[0] >= B[0] && A[1] <= B[1]) ||
             A[0] <= B[0] && A[1] >= B[1]);
}

const isOverlappedPair = pair => {
    /* AABB collision detection, but can skip y-axis */
    let [A, B] = (pair.split(',').map(range => range.split('-')
                                 .map(section => parseInt(section))));
    return !(A[1] < B[0] || A[0] > B[1]);

}

const solve = (input) => {
    input = input.split('\n');
    let day1 = input.map(pair => Number(isContainedPair(pair))).reduce((acc, val) => acc + val);
    let day2 = input.map(pair => Number(isOverlappedPair(pair))).reduce((acc, val) => acc + val);
    console.log(`Day 1: ${day1}`);
    console.log(`Day 2: ${day2}`);
}

const filePath = path.join(__dirname, "./input.txt");
const data = fs.readFileSync(filePath, 'utf-8');
solve(data);
