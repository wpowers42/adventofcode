import os
from collections import defaultdict

dir = os.path.dirname(os.path.realpath(__file__))

input = """467..114..
...*......
..35..633.
......#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598.."""

with open(os.path.join(dir, "./input.txt"), "r") as f:
    input = f.read()

input = input.split("\n")
input = [list(row) for row in input]


def check_cell(x, y):
    if x < 0 or x >= len(input[0]):
        return (False, False)
    if y < 0 or y >= len(input):
        return (False, False)
    return (not (input[y][x].isdigit() or input[y][x] == "."), input[y][x] == "*")


def handle_number(number, gears):
    x1 = number[0][0]
    x2 = number[-1][0]
    y1 = number[0][1]

    is_part = False
    neighbor_gears = set()

    # check left and right columns for non digit
    for x in [x1 - 1, x2 + 1]:
        for y in [y1 - 1, y1, y1 + 1]:
            is_valid, is_gear = check_cell(x, y)
            if is_valid:
                is_part = True

                if is_gear:
                    neighbor_gears.add((x, y))

    # check top and bottom rows for non digit
    for x in range(x1, x2 + 1):
        for y in [y1 - 1, y1 + 1]:
            is_valid, is_gear = check_cell(x, y)
            if is_valid:
                is_part = True

                if is_gear:
                    neighbor_gears.add((x, y))

    if is_part:
        value = int("".join([n[2] for n in number]))
        for gear in neighbor_gears:
            gears.setdefault(gear, []).append(value)
        return value
    else:
        return 0


part1 = 0
gears = defaultdict(list)
for y, row in enumerate(input):
    number = []
    for x, cell in enumerate(row):
        if cell.isdigit():
            number.append((x, y, cell))
        elif len(number) > 0:
            part1 += handle_number(number, gears)
            number = []

    if len(number) > 0:
        part1 += handle_number(number, gears)
        number = []

print("Part 1:", part1)

part2 = 0
for gear in gears:
    if len(gears[gear]) == 2:
        part2 += gears[gear][0] * gears[gear][1]
print("Part 2:", part2)
