import os
from itertools import combinations

dir = os.path.dirname(os.path.realpath(__file__))

example = """...#......
.......#..
#.........
..........
......#...
.#........
.........#
..........
.......#..
#...#....."""


def parse_input(input):
    input = [list(row) for row in input.split("\n")]
    return input


def solve(input, gap_size=1):
    input = parse_input(input)
    galaxies = find_galaxies(input)

    gaps = {"rows": set(), "columns": set()}

    for y in range(len(input)):
        for x in range(len(input[0])):
            # if there are no galaxies in the row, add the row to the gaps
            if not any([galaxy[0] == y for galaxy in galaxies]):
                gaps["rows"].add(y)
            # if there are no galaxies in the column, add the column to the gaps
            if not any([galaxy[1] == x for galaxy in galaxies]):
                gaps["columns"].add(x)

    # create a list of all possible pairs of galaxies
    pairs = list(combinations(galaxies, 2))

    return sum(map(lambda x: distance(*x, gaps, gap_size), pairs))


# find coordinates of every #
def find_galaxies(input):
    coords = []
    for y, row in enumerate(input):
        for x, char in enumerate(row):
            if char == "#":
                coords.append((y, x))
    return coords


def distance(a, b, gaps, gap_size):
    y1, x1 = a
    y2, x2 = b

    num_gaps = 0
    for gap in gaps["rows"]:
        if (y1 < gap < y2) or (y2 < gap < y1):
            num_gaps += 1

    for gap in gaps["columns"]:
        if (x1 < gap < x2) or (x2 < gap < x1):
            num_gaps += 1

    cost = abs(x1 - x2) + abs(y1 - y2) - num_gaps + (num_gaps * gap_size)
    return cost


with open(os.path.join(dir, "./input.txt"), "r") as f:
    input = f.read()

# print("Part 1: ", solve(example, 2))
# print("Part 2: ", solve(example, 10))
# print("Part 2: ", solve(example, 100))
print("Part 1: ", solve(input, 2))
print("Part 2: ", solve(input, 1_000_000))
