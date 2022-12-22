const fs = require('fs');
const path = require('path');


const namedtuple = (names) => {
    return (values) => {
        const object = {};
        names.forEach((name, index) => object[name] = values[index]);
        return object;
    };
}

const State = namedtuple(['minute', 'goalRobot', 'ore', 'clay', 'obsidian', 'geode', 'oreRobots', 'clayRobots', 'obsidianRobots', 'geodeRobots']);

class Blueprint {
    constructor(blueprint, minuteLimit) {
        this.parseBlueprint(blueprint);
        this.minuteLimit = minuteLimit;
        this.robotEnum = {
            ore: 0,
            clay: 1,
            obsidian: 2,
            geode: 3,
        }
        this.state = State([this.minuteLimit, 0, 0, 0, 0, 0, 1, 0, 0, 0]);
        this.triangularNumbers = new Array(24).fill(0).map((_, i) => parseInt(i * (i - 1) / 2));
    }


    simulate() {
        const states = [];
        for (let i = 0; i < 4; i++) {
            const state = structuredClone(this.state);
            state.goalRobot = i;
            states.push(state);
        }

        let maxGeodes = 0;
        let maxOreRobots = Math.max(this.clayRobotCost.ore, this.obsidianRobotCost.ore, this.geodeRobotCost.ore);
        let maxClayRobots = this.obsidianRobotCost.clay;
        let maxObsidianRobots = this.geodeRobotCost.obsidian;

        while (states.length) {
            const state = states.pop();

            if (state.geode >= maxGeodes) {
                maxGeodes = state.geode;
            }


            if (state.geode + state.minute * state.geodeRobots + this.triangularNumbers[state.minute] < maxGeodes || // optimistic case with this state is less than our current best
                state.goalRobot === this.robotEnum.ore && state.oreRobots >= maxOreRobots || // we don't need to make more ore robots
                state.goalRobot === this.robotEnum.clay && state.clayRobots >= maxClayRobots || // we don't need to make more clay robots
                state.goalRobot === this.robotEnum.obsidian && state.obsidianRobots >= maxObsidianRobots || // we don't need to make more obsidian robots
                state.goalRobot === this.robotEnum.obsidian && state.clayRobots === 0 || // we need to make clay robots before obsidian robots
                state.goalRobot === this.robotEnum.geode && state.obsidianRobos === 0) { // we need to make obsidian robots before geode robots
                continue;
            }

            for (const nextState of this.generatePossibleNextStates(state)) {
                states.push(nextState);
            }

        }

        return maxGeodes;

    }

    generatePossibleNextStates(state) {
        if (state.minute === 0) {
            return [];
        }

        const { goalRobot, ore, clay, obsidian } = state;

        const possibleNextStates = [];
        state.minute -= 1;
        state.ore += state.oreRobots;
        state.clay += state.clayRobots;
        state.obsidian += state.obsidianRobots;
        state.geode += state.geodeRobots;


        if (goalRobot === this.robotEnum.ore && ore >= this.oreRobotCost.ore) {
            state.oreRobots += 1;
            state.ore -= this.oreRobotCost.ore;
            for (let i = 0; i < 4; i++) {
                state.goalRobot = i;
                possibleNextStates.push(structuredClone(state));
            }
        }


        if (goalRobot === this.robotEnum.clay && ore >= this.clayRobotCost.ore) {
            state.clayRobots += 1;
            state.ore -= this.clayRobotCost.ore;
            for (let i = 0; i < 4; i++) {
                state.goalRobot = i;
                possibleNextStates.push(structuredClone(state));
            }
        }


        if (goalRobot === this.robotEnum.obsidian && ore >= this.obsidianRobotCost.ore && clay >= this.obsidianRobotCost.clay) {
            state.obsidianRobots += 1;
            state.ore -= this.obsidianRobotCost.ore;
            state.clay -= this.obsidianRobotCost.clay;
            for (let i = 0; i < 4; i++) {
                state.goalRobot = i;
                possibleNextStates.push(structuredClone(state));
            }
        }

        if (goalRobot === this.robotEnum.geode && ore >= this.geodeRobotCost.ore && obsidian >= this.geodeRobotCost.obsidian) {
            state.geodeRobots += 1;
            state.ore -= this.geodeRobotCost.ore;
            state.obsidian -= this.geodeRobotCost.obsidian;
            for (let i = 0; i < 4; i++) {
                state.goalRobot = i;
                possibleNextStates.push(structuredClone(state));
            }
        }

        if (possibleNextStates.length === 0) {
            possibleNextStates.push(state);
        }

        return possibleNextStates;

    }

    parseBlueprint(blueprint) {
        const numbers = this.getNumbers(blueprint);
        this.blueprintID = numbers[0];

        this.oreRobotCost = {
            ore: numbers[1],
        }

        this.clayRobotCost = {
            ore: numbers[2],
        }

        this.obsidianRobotCost = {
            ore: numbers[3],
            clay: numbers[4],
        }

        this.geodeRobotCost = {
            ore: numbers[5],
            obsidian: numbers[6],
        }

    }

    getNumbers(blueprint) {
        return blueprint.match(/\d+/g).map(Number);
    }

}


const solve = (input) => {
    let qualityLevelSum = 0;
    input.split('\n').forEach(blueprint => {
        const blueprintObj = new Blueprint(blueprint, 24);
        qualityLevelSum += blueprintObj.blueprintID * blueprintObj.simulate();
    });
    console.log(`Part 1: ${qualityLevelSum}`);

    let qualityLevelProduct = 1;
    input.split('\n').slice(0, 3).forEach(blueprint => {
        qualityLevelProduct *= new Blueprint(blueprint, 32).simulate();
    });
    console.log(`Part 2: ${qualityLevelProduct}`);
}

const filePath = path.join(__dirname, "./input.txt");
const input = fs.readFileSync(filePath, 'utf-8');

solve(input);
