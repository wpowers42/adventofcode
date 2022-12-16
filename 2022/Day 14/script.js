class PointSet {
    constructor() {
        this.points = new Set();
    }

    length() {
        return this.points.size;
    }

    values() {
        let points = [];
        for (const point of this.points) {
            let [x, y] = point.split(',');
            points.push({x: parseInt(x), y: parseInt(y)});
        }
        return points;
    }

    has(x, y) {
        return this.points.has(`${x},${y}`);
    }

    add(x, y) {
        this.points.add(`${x},${y}`);
    }
}

class Sand {
    constructor(cave) {
        this.cave = cave;
        this.x = 500;
        this.y = 0;
        this.isResting = false;
    }

    update(dt) {
        if (this.isResting) {
            return;
        }
        if (!this.cave.checkLocation(this.x, this.y + 1)) {
            // below is open
            this.y += 1
        } else if (!this.cave.checkLocation(this.x - 1, this.y + 1)) {
            // below left is open
            this.x += -1
            this.y += 1
        } else if (!this.cave.checkLocation(this.x + 1, this.y + 1)) {
            // below right is open
            this.x += 1
            this.y += 1
        } else {
            // all destinations are blocked, come to rest
            if (this.y === this.cave.floorY - 1 && !this.cave.isPart2) {
                this.cave.isPart2 = true;
            }
            this.isResting = true;
            this.cave.inactiveSand.add(`${this.x},${this.y}`);
            this.cave.inactiveSandSprites.push(this);
            this.cave.sand = this.cave.sand.filter(sand => !sand.isResting);
            if (!this.cave.isPart2) {
                this.cave.part1 += 1;
            }
            this.cave.part2 += 1;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.isResting ? 'gold' : 'green';
        ctx.fillRect(this.x, this.y, 1, 1);
    }

}

class Cave {
    constructor(input) {
        this.paths = this.parseInput(input);
        this.rock = new PointSet();
        this.parsePaths(this.paths);
        this.floorY = this.rock.values().map(rock => rock.y).reduce((acc, val) => Math.max(acc, val)) + 2;
        this.sand = [];
        this.inactiveSand = new Set();
        this.inactiveSandSprites = [];
        this.part1 = 0;
        this.part2 = 0;
        this.isPart2 = false;
    }

    checkLocation(x, y) {
        if (this.inactiveSand.has(`${x},${y}`)) {
            return true;
        }

        for (const sand of this.sand) {
            if (x === sand.x && y === sand.y) {
                return true;
            }
        }

        return y >= this.floorY || this.rock.has(x, y);
    }

    parsePaths(paths) {
        paths.forEach(path => {
            for (let i = 1; i < path.length; i++) {
                let [x1, y1] = [path[i - 1].x, path[i - 1].y];
                let [x2, y2] = [path[i].x, path[i].y];
                let dx = x2 - x1 > 0 ? 1 : x2 - x1 < 0 ? -1 : 0;
                let dy = y2 - y1 > 0 ? 1 : y2 - y1 < 0 ? -1 : 0;
                while (x1 !== x2 || y1 !== y2) {
                    this.rock.add(x1, y1);
                    x1 += dx;
                    y1 += dy;
                }
                this.rock.add(x1, y1);
            }
        });
    }

    parseInput(input) {
        return input.split('\n').map(path => path.split(' -> ').map((point) => {
            let [x, y] = point.split(',');
            return { x: parseInt(x), y: parseInt(y) };
        }));
    }

    update(dt) {
        this.sand.forEach(sand => {
            sand.update(dt);
        });
        
        if (!this.checkLocation(500,0)) {
            // spawn point is clear
            this.sand.push(new Sand(this));
        }

    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx) {

        ctx.fillStyle = 'white';
        for (const rock of this.rock.values()) {
            ctx.fillRect(rock.x, rock.y, 1, 1);
        }
        ctx.fillText(`Part 1: ${this.part1}`, 300, 10);
        ctx.fillText(`Part 2: ${this.part2}`, 300, 20);

        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.moveTo(200, this.floorY);
        ctx.lineTo(700, this.floorY);
        ctx.stroke();


        this.sand.forEach(sand => sand.draw(ctx));
        this.inactiveSandSprites.forEach(sand => sand.draw(ctx));

    }
}

const solve = (input) => {
    const canvas = document.getElementById('canvas');
    /** @type {CanvasRenderingContext2D} */
    const ctx = canvas.getContext('2d');

    const virtualWidth = window.innerWidth;
    const virtualHeight = window.innerHeight;

    canvas.width = virtualWidth;
    canvas.height = virtualHeight;

    const cave = new Cave(input);

    const fps = 500;
    const dt = 1000 / fps;
    let accumulator = 0;
    let lastTime = performance.now();

    let t = 4;
    ctx.setTransform({
        a: t,
        b: 0,
        c: 0,
        d: t,
        e: -350 * t + 200,
        f: 0
    });

    const animate = () => {
        const newTime = performance.now();
        accumulator += newTime - lastTime;
        lastTime = newTime;

        while (accumulator > dt) {
            accumulator -= dt;
            cave.update(dt);
        }

        ctx.clearRect(0, 0, virtualWidth, virtualHeight);
        cave.draw(ctx);
        requestAnimationFrame(animate);
    }

    animate();

}

fetch('input.txt')
    .then(req => req.text())
    .then(solve);
