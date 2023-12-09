import os
import re
import math

dir = os.path.dirname(os.path.realpath(__file__))

input = """RL

AAA = (BBB, CCC)
BBB = (DDD, EEE)
CCC = (ZZZ, GGG)
DDD = (DDD, DDD)
EEE = (EEE, EEE)
GGG = (GGG, GGG)
ZZZ = (ZZZ, ZZZ)"""

with open(os.path.join(dir, "./input.txt"), "r") as f:
    input = f.read()


def parse_input(input):
    instructions, network = input.split("\n\n")
    network = {
        node.split(" = ")[0]: node.split(" = ")[1] for node in network.split("\n")
    }
    for key in network:
        L, R = [re.search("[A-Z0-9]{3}", side) for side in network[key].split(", ")]
        network[key] = {"L": L.group(0), "R": R.group(0)}

    return instructions, network


def part_1(instructions, network):
    node = "AAA"
    step = 0
    while node != "ZZZ":
        instruction = instructions[step % len(instructions)]
        if instruction == "R":
            node = network[node]["R"]
        elif instruction == "L":
            node = network[node]["L"]
        step += 1
    return step


def part_2(instructions, network):
    nodes = [node for node in network if node[-1] == "A"]
    step = 0

    for index, node in enumerate(nodes):
        while node[-1] != "Z":
            instruction = instructions[step % len(instructions)]
            if instruction == "R":
                node = network[node]["R"]
            elif instruction == "L":
                node = network[node]["L"]
            step += 1
        nodes[index] = step
        step = 0

    return math.lcm(*nodes)


instructions, network = parse_input(input)

print("Part 1:", part_1(instructions, network))
print("Part 2:", part_2(instructions, network))
