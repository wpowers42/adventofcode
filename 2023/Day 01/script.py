import os
import re

dir = os.path.dirname(os.path.realpath(__file__))


input = """1abc2
pqr3stu8vwx
a1b2c3d4e5f
treb7uchet"""


def part1(input):
    total = 0
    for line in input.split("\n"):
        digits = "".join([c for c in line if c.isdecimal()])
        a, b = digits[0], digits[-1]
        total += int(a + b)
    print(total)


# part1(input)

with open(os.path.join(dir, "./input.txt"), "r") as f:
    input = f.read()
    part1(input)


def find_numbers(line):
    positions = []
    for number in number_map.keys():
        for m in re.finditer(number, line):
            positions.append((m.start(), number_map[number]))

    for m in re.finditer("\d", line):
        positions.append((m.start(), m.group()))

    positions.sort()
    return positions


def part2(input):
    total = 0
    for line in input.split("\n"):
        positions = find_numbers(line)
        total += int(positions[0][1] + positions[-1][1])
    print(total)


number_map = {
    "one": "1",
    "two": "2",
    "three": "3",
    "four": "4",
    "five": "5",
    "six": "6",
    "seven": "7",
    "eight": "8",
    "nine": "9",
}

# input = """two1nine
# eightwothree
# abcone2threexyz
# xtwone3four
# 4nineeightseven2
# zoneight234
# 7pqrstsixteen"""
#
# part2(input)

part2(input)
