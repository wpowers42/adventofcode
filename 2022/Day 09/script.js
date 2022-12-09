const fs = require('fs');
const path = require('path');

class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Knot {
    constructor(referenceKnot) {
        this.position = new Vector2(0, 0);
        this.locations = new Set();
        this.referenceKnot = referenceKnot;
    }

    update() {
        if (!this.referenceKnot) {
            // head, do nothing. update handled in Rope class
            return
        }
        /** check position relative to reference knot */
        let dx = this.referenceKnot.position.x - this.position.x;
        let dy = this.referenceKnot.position.y - this.position.y;
        if (!(Math.abs(dx) <= 1 && Math.abs(dy) <= 1)) {
            if (dx === 0) {
                // are in same column, move one step towards referenceKnot along y axis
                this.position.y += dy > 0 ? 1 : -1;
            } else if (dy === 0) {
                // are in same row, move one step towards referenceKnot along x axis
                this.position.x += dx > 0 ? 1 : -1;
            } else {
                // are not in same row or column, move one step towards referenceKnot
                // along x and y axis;
                this.position.y += dy > 0 ? 1 : -1;
                this.position.x += dx > 0 ? 1 : -1;
            }
        }
        this.locations.add(`${this.position.x}_${this.position.y}`);
    }
}


class Rope {
    static directionVectors = {
        'L': new Vector2(-1, 0),
        'R': new Vector2(1, 0),
        'U': new Vector2(0, -1),
        'D': new Vector2(0, 1),
    }

    constructor(numberOfKnots) {
        this.knots = [];
        for (let i = 0; i < numberOfKnots; i++) {
            if (this.knots.length === 0) {
                this.knots.push(new Knot(null));
            } else {
                this.knots.push(new Knot(this.knots[i - 1]));
            }
        }
        this.head = this.knots[0];
    }

    update(motion) {
        const [direction, steps] = motion.split(' ');
        const stepVector = Rope.directionVectors[direction];
        for (let i = 0; i < steps; i++) {
            // move head
            this.head.position.x += stepVector.x;
            this.head.position.y += stepVector.y;
            this.knots.forEach(knot => knot.update());
        }
    }

}


const solve = (input) => {
    const motions = input.split('\n');
    const rope = new Rope(10);
    motions.forEach(motion => rope.update(motion));
    console.log(`Part 1: ${rope.knots[1].locations.size}`);
    console.log(`Part 2: ${rope.knots[9].locations.size}`);
}

const filePath = path.join(__dirname, "./input.txt");
const input = fs.readFileSync(filePath, 'utf-8');
solve(input);
