const fs = require('fs');
const path = require('path');


const rotateMatrixRight = (matrix) => {
    let rotatedMatrix = [];

    for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
            if (c + 1 > rotatedMatrix.length) {
                rotatedMatrix.push([]);
            }
            rotatedMatrix[c].push(matrix[r][c]);
        }
    }

    rotatedMatrix.forEach(row => row.reverse());
    return rotatedMatrix;
}

const checkLineForVisibleTrees = (line, visibleTrees) => {
    let visibleHeight = -1;
    for (let i = 0; i < line.length; i++) {
        let tree = line[i];
        if (tree.height > visibleHeight) {
            visibleTrees.add(tree.xyCoordinates);
            visibleHeight = tree.height;
            if (visibleHeight === 9) {
                break;
            }
        }
    }
}

const parseInputPart1 = (input) => {
    return input.split('\n').map((row, rix) => row.split('').map((tree, cix) => {
        return {
            xyCoordinates: `${cix}_${rix}`,
            height: tree
        }
    }));
}

const parseInputPart2 = (input) => {
    const forest = {};
    input.split('\n').forEach((row, rix) => row.split('').forEach((treeHeight, cix) => {
        forest[[cix, rix]] = parseInt(treeHeight);
    }));
    return forest;
}

const scenicScore = (treeCoordinate, forest) => {
    const treeHeight = forest[treeCoordinate];
    let viewingDistances = [];
    [-1, 1].forEach(dx => {
        let score = 0;
        let x = treeCoordinate[0] + dx;
        const y = treeCoordinate[1];
        while (forest[[x,y]] >= 0) {
            score += 1;
            if (forest[[x,y]] >= treeHeight) {
                break;
            }
            x += dx;
        }
        viewingDistances.push(score);
    });
    

    [-1, 1].forEach(dy => {
        let score = 0;
        const x = treeCoordinate[0];
        let y = treeCoordinate[1] + dy;
        while (forest[[x,y]] >= 0) {
            score += 1;
            if (forest[[x,y]] >= treeHeight) {
                break;
            }
            y += dy;
        }
        viewingDistances.push(score);
    });
    return viewingDistances.reduce((acc, val) => acc * val); // a 0 means edge
}

const part2 = (forest) => {
    let best = 0;
    for(let x = 0; x < 99; x++) {
        for(let y = 0; y < 99; y++) {
            best = Math.max(best, scenicScore([x,y], forest));
            
        }   
    }
    return best;
}

const solve = (input) => {
    let forest = parseInputPart1(input);
    const visibleTrees = new Set();
    forest.forEach(line => checkLineForVisibleTrees(line, visibleTrees));
    forest = rotateMatrixRight(forest);
    forest.forEach(line => checkLineForVisibleTrees(line, visibleTrees));
    forest = rotateMatrixRight(forest);
    forest.forEach(line => checkLineForVisibleTrees(line, visibleTrees));
    forest = rotateMatrixRight(forest);
    forest.forEach(line => checkLineForVisibleTrees(line, visibleTrees));
    console.log(`Part 1: ${visibleTrees.size}`);
    
    forest = parseInputPart2(input);
    console.log(`Part 2: ${part2(forest)}`);
}

const filePath = path.join(__dirname, "./input.txt");
const input = fs.readFileSync(filePath, 'utf-8');
solve(input);
