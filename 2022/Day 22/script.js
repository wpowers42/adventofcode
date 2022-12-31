/**
 * Credit: https://github.com/AxlLind/AdventOfCode2022/blob/main/src/bin/22.rs
 */

const fs = require('fs');
const path = require('path');

// L D R U
const DIR = [[0, -1], [1, 0], [0, 1], [-1, 0]];

const wrap1 = (map, r, c, dir) => {
    const [dr, dc] = DIR[dir];
    let moving = true;
    while (moving) {
        const [nr, nc] = [r + dr, c + dc];
        r = nr < 0 ? 199 : nr > 199 ? 0 : nr;
        c = nc < 0 ? 149 : nc > 149 ? 0 : nc;
        if (map[r][c] !== ' ') {
            moving = false;
        }
    }
    return [r, c, dir];
}

const wrap2 = (_, r, c, dir) => {
    let qr, qc, ndir;
    switch ([Math.floor(r / 50), Math.floor(c / 50), dir].join(',')) {
        case '0,1,0':
            [qr, qc, ndir] = [2, 0, 2];
            break;
        case '0,1,3':
            [qr, qc, ndir] = [3, 0, 2];
            break;
        case '0,2,1':
            [qr, qc, ndir] = [1, 1, 0];
            break;
        case '0,2,2':
            [qr, qc, ndir] = [2, 1, 0];
            break;
        case '0,2,3':
            [qr, qc, ndir] = [3, 0, 3];
            break;
        case '1,1,0':
            [qr, qc, ndir] = [2, 0, 1];
            break;
        case '1,1,2':
            [qr, qc, ndir] = [0, 2, 3];
            break;
        case '2,0,0':
            [qr, qc, ndir] = [0, 1, 2];
            break;
        case '2,0,3':
            [qr, qc, ndir] = [1, 1, 2];
            break;
        case '2,1,1':
            [qr, qc, ndir] = [3, 0, 0];
            break;
        case '2,1,2':
            [qr, qc, ndir] = [0, 2, 0];
            break;
        case '3,0,0':
            [qr, qc, ndir] = [0, 1, 1];
            break;
        case '3,0,1':
            [qr, qc, ndir] = [0, 2, 1];
            break;
        case '3,0,2':
            [qr, qc, ndir] = [2, 1, 3];
            break;
        default:
            console.log('WRAP ERROR');
    }
    const [dr, dc] = [r % 50, c % 50];
    const i = [dc, dr, 49 - dc, 49 - dr][3 - dir];
    const [nr, nc] = [[49, i], [i, 0], [0, 49 - i], [49 - i, 49]][3 - ndir];
    return [qr * 50 + nr, qc * 50 + nc, ndir];
}

const walk = (map, moves, wrap) => {
    let [r, c, dir] = [0, 0, 2];
    // starting position is first empty tile on top row
    while (map[0][c] !== '.') {
        c++;
    }

    for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        switch (move) {
            case 'R':
                dir = (dir + 3) % 4;
                break;
            case 'L':
                dir = (dir + 1) % 4;
                break;
            default:
                for (let i = 0; i < move; i++) {
                    const [dr, dc] = DIR[dir];
                    const onMap = r + dr >= 0 && r + dr < 200 && c + dc >= 0 && c + dc < 150;
                    if (onMap && map[r + dr][c + dc] === '.') {
                        r += dr;
                        c += dc;
                    } else if (onMap && map[r + dr][c + dc] === '#') {
                        break;
                    } else {
                        const [nr, nc, d] = wrap(map, r, c, dir);
                        if (map[nr][nc] === '#') {
                            break;
                        }
                        [r, c, dir] = [nr, nc, d];
                    }
                }
        }
    };

    return 1000 * (r + 1) + 4 * (c + 1) + [2, 1, 0, 3][dir];
}

const tests = () => {
    console.log('100 5 1 :', wrap2(null, 55, 50, 0).join(' '));
    console.log('144 0 2 :', wrap2(null, 5, 50, 0).join(' '));
    console.log('149 50 3:', wrap2(null, 150, 49, 2).join(' '));
}

tests();

const solve = (input) => {
    let [map, moves] = input.split('\n\n');
    const newMap = new Array(200).fill(0).map(() => new Array(150).fill(' '));
    map.split('\n').forEach((row, r) => {
        row.split('').forEach((tile, c) => {
            newMap[r][c] = tile;
        });
    });
    map = newMap;
    moves = moves.match(/\d+|[LR]/g).map(move => {
        if (move === 'L' || move === 'R') {
            return move;
        } else {
            return parseInt(move);
        }
    });

    console.log(`Part 1: ${walk(map, moves, wrap1)}`);
    console.log(`Part 2: ${walk(map, moves, wrap2)}`);
}

const filePath = path.join(__dirname, "./input.txt");
const input = fs.readFileSync(filePath, 'utf-8');

solve(input);
