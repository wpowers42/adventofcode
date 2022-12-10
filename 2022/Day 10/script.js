const fs = require('fs');
const path = require('path');

class CPU {
    constructor() {
        this.x = 1;
        this.cycle = 0;
        this.signalStrengths = [];
        this.crtPixels = [];
        this.nextCycleCheck = 20;
        this.instructionQueue = null;
        this.pipeline = null;
    }

    fetch(instruction) {
        // start next cycle
        this.cycle += 1;

        this.checkSignal();
        this.drawPixel();

        // add instruction to pipeline
        this.pipeline = instruction === 'noop' ? null : instruction;

        this.execute();
    }

    checkSignal() {
        if (this.cycle === this.nextCycleCheck) {
            this.signalStrengths.push(this.x * this.nextCycleCheck);
            this.nextCycleCheck += 40;
        }
    }

    drawPixel() {
        if ((this.cycle - 1) % 40 >= this.x - 1 &&
            (this.cycle - 1) % 40 <= this.x + 1) {
            this.crtPixels.push('#');
        } else {
            this.crtPixels.push('.');
        }
    }

    execute() {
        if (this.instructionQueue) {
            this.x += parseInt(this.instructionQueue.split(' ')[1]);
            this.instructionQueue = null;
        } else if (this.pipeline) {
            this.instructionQueue = this.pipeline;
            this.pipeline = null;
            this.fetch('noop');
        }
    }
}

const solve = (input) => {
    input = input.split('\n');

    const cpu = new CPU();
    input.forEach(instruction => cpu.fetch(instruction));

    console.log(`Part 1: ${cpu.signalStrengths.reduce((acc, val) => acc + val)}`);

    console.log('Part 2:');
    buffer = [];
    cpu.crtPixels.forEach((pixel, index) => {
        buffer.push(pixel);
        if ((index + 1) % 40 === 0) {
            console.log(buffer.join(''));
            buffer = [];
        }
    });
}

const filePath = path.join(__dirname, "./input.txt");
const input = fs.readFileSync(filePath, 'utf-8');

solve(input);
