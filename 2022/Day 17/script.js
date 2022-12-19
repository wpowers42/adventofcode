class Rock {
    static shapes = {
        0: [[1, 1, 1, 1]],
        1: [[0, 1, 0], [1, 1, 1], [0, 1, 0]],
        2: [[0, 0, 1], [0, 0, 1], [1, 1, 1]],
        3: [[1], [1], [1], [1]],
        4: [[1, 1], [1, 1]],
    }

    constructor(chamber, type) {
        this.chamber = chamber;
        this.x = 2;
        this.shape = Rock.shapes[type];
        this.height = this.shape.length;
        this.width = this.shape[0].length;
        this.y = 0 - this.height;
    }

    update(dx) {
        if (!this.chamber.checkCollision(this.x + dx, this.y, this)) {
            // rock moves one unit in direction of wind
            this.x += dx;
        }

        if (!this.chamber.checkCollision(this.x, this.y + 1, this)) {
            // rock falls one unit
            this.y += 1;
        } else {
            // rock comes to rest
            this.chamber.handleLandedRock(this);
        }
    }

    draw(ctx) {
        ctx.fillStyle = 'white';
        for (let sy = 0; sy < this.shape.length; sy++) {
            for (let sx = 0; sx < this.shape[0].length; sx++) {
                if (this.shape[sy][sx] === 1) {
                    // draw pixel
                    ctx.fillRect(this.x + sx, this.y + sy, 1, 1);
                }
            }
        }
    }
}

class Chamber {
    constructor(wind) {
        this.x = 0;
        this.y = 0;
        this.wind = wind;
        this.windIndex = 0;
        this.width = 7;
        this.height = 3;
        this.spawnedRocks = 0;
        this.nextRockType = 0;
        this.part1 = 2022
        this.part2 = 10000;
        this.fallingRock;
        this.spawnRock();
        this.landedRocks = new Array(this.height).fill(0).map(() => new Array(this.width).fill(0));
        this.heights = [];
    }

    spawnRock() {
        this.spawnedRocks += 1;
        if (this.spawnedRocks === this.part1 + 1) {
            this.part1Answer = this.highestRock();
            console.log(`Part 1: ${this.highestRock()}`);
        } else {
            this.fallingRock = new Rock(this, this.nextRockType);
            this.nextRockType = (this.nextRockType + 1) % Object.keys(Rock.shapes).length;
        }

    }

    highestRock() {
        for (let i = 0; i < this.landedRocks.length; i++) {
            if (this.landedRocks[i].reduce((acc, val) => acc + val) > 0) {
                return this.landedRocks.length - i;
            }
        }

        return 0;


    }

    addRow() {
        this.landedRocks.unshift(new Array(this.width).fill(0));
        this.height += 1;
    }

    handleLandedRock(rock) {
        // add rock to landed rocks
        let { x, y, shape } = rock;
        while (y < 0) {
            this.addRow();
            y += 1;
        }

        for (let sy = 0; sy < shape.length; sy++) {
            for (let sx = 0; sx < shape[0].length; sx++) {
                if (shape[sy][sx] === 1) {
                    this.landedRocks[y + sy][x + sx] = 1;
                }
            }
        }

        // find top row
        let highestRock = this.highestRock();
        this.heights.push(highestRock);
        // console.log(`${this.heights[this.heights.length - 1] / this.spawnedRocks}`);
        let topRow = this.landedRocks.length - highestRock;

        // insert new empty rows
        for (let i = 0; i < 3 - topRow; i++) {
            this.addRow();
        }

        // spawn new rock
        this.spawnRock();

    }

    checkCollision(x, y, rock) {

        // check wall collisions
        if (x < 0 || x + rock.width > this.width) {
            return true;
        }

        // check floor collision
        if (y + rock.height > this.y + this.height) {
            return true;
        }

        // check rock collisions
        for (let sy = 0; sy < rock.height; sy++) {
            if (y + sy < 0) {
                continue;
            }
            for (let sx = 0; sx < rock.width; sx++) {
                if (rock.shape[sy][sx] === 1 && this.landedRocks[y + sy][x + sx] === 1) {
                    return true;
                }
            }
        }

        // no collisions detected
        return false;
    }

    update() {
        if (this.spawnedRocks <= this.part2) {
            this.fallingRock.update(this.wind[this.windIndex] === '<' ? -1 : 1);
            this.windIndex = (this.windIndex + 1) % this.wind.length;
        } else if (!this.comparesPrinted) {
            this.comparesPrinted = true;
            for (let i = 1; i < 10000; i++) {
                let compares = [];
                for (let j = 0; j < 10; j++) {
                    let current = this.heights[this.heights.length - 1 - j];
                    let prior = this.heights[this.heights.length - 1 - j - i];
                    compares.push(current - prior);
                }
                if (new Set(compares).size === 1) {
                    // Part 2: What is the height after 1,000,000,000,000 blocks?
                    const targetBlocks = 1000000000000;

                    // Block height increases eventually starts to repeat every ith block
                    const blockCycle = i;
                    const blockCycleHeight = compares[0];

                    // Find remainder between Part 2 requirement and block cycle
                    const remainder = targetBlocks % blockCycle;

                    // Use a known height as the base to compute final height.
                    // Here I use the height @ the remainder (zero-indexed) number of blocks
                    const baseHeight = this.heights[remainder - 1];

                    // Calculate number of cycles required to reach 1T blocks
                    const cycles = (targetBlocks - remainder) / blockCycle;
                    const finalHeight = baseHeight + cycles * blockCycleHeight;

                    this.part2Answer = finalHeight;
                    console.log(`Part 2: ${finalHeight}`);
                    break;
                }
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - 1, this.y, 1, this.height + 1);
        ctx.fillRect(this.x + this.width, this.y, 1, this.height + 1);
        ctx.fillRect(this.x, this.y + this.height, this.width, 1);

        ctx.font = '2px Courier';
        ctx.fillText(`Part 1: ${this.part1Answer || '...'}`, 10, 2);
        ctx.fillText(`Part 2: ${this.part2Answer || '...'}`, 10, 8);

        ctx.fillStyle = 'grey';
        this.landedRocks.slice(0, 100).forEach((row, y) => {
            row.forEach((pixel, x) => {
                if (pixel === 1) {
                    ctx.fillRect(x, y, 1, 1);
                }
            })
        })
        this.fallingRock.draw(ctx);
    }

}

const solve = (input) => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const scalingFactor = 10;
    ctx.scale(scalingFactor, scalingFactor);

    const chamber = new Chamber(input);

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Update 200 frames per animate to speed things up
        for (let i = 0; i < 200; i++) {
            chamber.update();
        }

        // shift slightly right and down
        const padding = 4;
        ctx.translate(Math.round(canvas.width / (scalingFactor * 4)), padding);
        chamber.draw(ctx);
        ctx.translate(Math.round(-canvas.width / (scalingFactor * 4)), -padding);
        requestAnimationFrame(animate);
    }

    animate();
}

fetch('input.txt')
    .then(req => req.text())
    .then(solve);
