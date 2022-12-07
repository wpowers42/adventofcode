const fs = require('fs');
const path = require('path');

class Node {
    constructor(directory, parent) {
        this.directory = directory;
        this.parent = parent;
        this.size = 0;
        this.children = [];
    }

    addFile(fileSize) {
        this.size += parseInt(fileSize);
    }

    addDirectory(directory) {
        this.children.push(new Node(directory, this))
    }

    directorySize() {
        if (this.children.length === 0) {
            return this.size;
        } else {
            return this.size + this.children.map(child => child.directorySize()).reduce((acc, val) => acc + val);
        }
    }
}

const createDirectoryTree = (input) => {
    const root = new Node('/', null);
    let currentNode = root;
    for (let i = 1; i < input.length; i++) {
        let line = input[i].split(' ');
        // console.log(line);
        if (line[0] === '$' && line[1] === 'cd') {
            if (line[2] === '..') {
                currentNode = currentNode.parent;
            } else {
                currentNode = currentNode.children.filter(child => child.directory === line[2])[0];
            }
        } else if (line[0] === '$' && line[1] === 'ls') {
            continue;
        } else if (line[0] === 'dir') {
            currentNode.addDirectory(line[1]);
        } else {
            currentNode.addFile(line[0]);
        }
    }

    return root;
}

const part1 = (root) => {
    let total = 0;
    const frontier = [root];
    while (frontier.length > 0) {
        const currentNode = frontier.shift();
        currentNode.children.forEach(child => frontier.push(child));
        const directorySize = currentNode.directorySize();
        total += directorySize <= 100000 ? directorySize : 0;
    }
    return total;
}

const part2 = (root) => {
    const target = 30000000 - (70000000 - root.directorySize());
    let minSize = root.directorySize();
    const frontier = [root];

    while (frontier.length > 0) {
        const currentNode = frontier.shift();
        currentNode.children.forEach(child => frontier.push(child));
        const directorySize = currentNode.directorySize();
        if (directorySize >= target) {
            minSize = Math.min(directorySize, minSize);
        }
    }

    return minSize;
}

const solve = (input) => {
    input = input.split('\n');
    const root = createDirectoryTree(input);
    console.log(`Part 1: ${part1(root)}`);
    console.log(`Part 2: ${part2(root)}`);
}

const filePath = path.join(__dirname, "./input.txt");
const data = fs.readFileSync(filePath, 'utf-8');
solve(data);
