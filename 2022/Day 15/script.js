const fs = require('fs');
const path = require('path');

const signalAtPosition = (x, y, sensors) => {
    for (const sensor of sensors) {
        if (sensor.bx === x && sensor.by === y) {
            // beacon at position
            return 1;
        } else if (sensor.d >= Math.abs(sensor.sx - x) + Math.abs(sensor.sy - y)) {
            // within sensor range, no beacon at position
            return 0;
        }
    }
    // not in any sensor's range
    return undefined;
}

const part1 = (sensors) => {
    const x0 = sensors.map(s => s.sx - s.d).reduce((acc, val) => Math.min(acc, val));
    const x1 = sensors.map(s => s.sx + s.d).reduce((acc, val) => Math.max(acc, val));
    const y = 2000000;
    let positionsWithoutBeacon = 0;
    for (let x = x0; x < x1 + 1; x++) {
        if (signalAtPosition(x, y, sensors) === 0) {
            positionsWithoutBeacon += 1;
        }
    }
    return positionsWithoutBeacon;
}

const part2 = (sensors) => {
    const limit = 4000000;

    for (const sensor of sensors) {
        let x0 = sensor.sx - sensor.d - 1;
        let x1 = sensor.sx + sensor.d + 1;

        for (let x = Math.max(x0, 0); x < Math.min(x1 + 1, limit); x++) {
            let dy = sensor.d - Math.abs(x - sensor.sx) + 1;
            let y0 = sensor.sy - dy;
            let y1 = sensor.sy + dy;

            if (y0 >= 0 && y0 <= limit) {
                if (signalAtPosition(x, y0, sensors) === undefined) {
                    return x * 4000000 + y0;
                }
            }

            if (y1 >= 0 && y1 <= limit) {
                if (signalAtPosition(x, y1, sensors) === undefined) {
                    return x * 4000000 + y1;
                }
            }

        }
    }
}

const solve = (input) => {
    const sensors = input.split('\n').map(data => {
        const [sx, sy, bx, by] = data.match(/-?\d+/g).map(n => parseInt(n));
        const d = Math.abs(bx - sx) + Math.abs(by - sy);
        return { sx: sx, sy: sy, bx: bx, by: by, d: d }
    });

    console.log(`Part 1: ${part1(sensors)}`);
    console.log(`Part 2: ${part2(sensors)}`);
}


const filePath = path.join(__dirname, "./input.txt");
const input = fs.readFileSync(filePath, 'utf-8');

solve(input);
