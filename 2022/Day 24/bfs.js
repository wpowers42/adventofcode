/**
 * Credit: https://www.reddit.com/r/adventofcode/comments/zu28ij/comment/j1gs2ap
 */

const fs = require('fs');
const path = require('path');

const mod = (n, m) => ((n % m) + m) % m;
const toS = items => items.join(',');
const toI = (string) => string.split(',').map(Number);

const solve = (input) => {
    const W = new Set();
    const B = new Set();

    input.split('\n').forEach((line, y) => {
        line.split('').forEach((c, x) => {
            if (c === '#') W.add(toS([x - 1, y - 1]));
            if (c === '>') B.add(toS([x - 1, y - 1, +1, 0]));
            if (c === '<') B.add(toS([x - 1, y - 1, -1, 0]));
            if (c === '^') B.add(toS([x - 1, y - 1, 0, -1]));
            if (c === 'v') B.add(toS([x - 1, y - 1, 0, +1]));
        });
    });

    const [X, Y] = [...W].reduce(([X, Y], v) => {
        const [x, y] = toI(v);
        return [Math.max(X, x), Math.max(Y, y)];
    }, [0, 0]);
    console.log(`Maze Size: ${X}x${Y}, ${W.size} walls, ${B.size} blizzard`);

    for (let i = -1; i < 3; i++) {
        W.add(toS([i, -2]));
    }
    for (let i = X - 3; i < X + 2; i++) {
        W.add(toS([i, Y + 1]));
    }

    const start = toS([0, -1]);
    const exit = toS([X - 1, Y]);

    let t = 0;
    let q = new Set();
    q.add(start);
    const goals = [exit, start, exit];
    while (goals.length) {
        t += 1;
        // where are the blizzards at time t?
        const b = new Set();
        [...B].forEach(blizzard => {
            const [px, py, dx, dy] = toI(blizzard);
            b.add(toS([mod(px + t * dx, X), mod(py + t * dy, Y)]));
        });

        // where are the possible steps at time t from positions n?
        const n = new Set();
        [...q].forEach(position => {
            const [px, py] = toI(position);
            [[1, 0], [0, 1], [-1, 0], [0, -1], [0, 0]].forEach(d => {
                const [dx, dy] = d;
                n.add(toS([px + dx, py + dy]));
            });
        });

        // which of the possible steps are valid? that is, not a wall or blizzard.
        q = difference(difference(n, b), W);

        if (q.has(goals[0])) {
            console.log(`Goal ${goals[0]} reached after ${t} steps (queue size: ${q.size})`);
            q = new Set();
            q.add(goals.shift());
        }
    }

}

const difference = (setA, setB) => {
    const _difference = new Set(setA);
    for (const elem of setB) {
        _difference.delete(elem);
    }
    return _difference;
}

const filePath = path.join(__dirname, "./input.txt");
const input = fs.readFileSync(filePath, 'utf-8');

const start = performance.now();
solve(input);
console.log(performance.now() - start);
