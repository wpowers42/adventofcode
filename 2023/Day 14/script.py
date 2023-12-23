from functools import cache

with open("input.txt") as f:
    input = f.read()


example = """O....#....
O.OO#....#
.....##...
OO.#O....O
.O.....O#.
O.#..O.#.#
..O..#O..O
.......O..
#....###..
#OO..#...."""


@cache
def next_coord(coord, dir):
    return [
        coord[0] + (dir == "S") - (dir == "N"),
        coord[1] + (dir == "E") - (dir == "W"),
    ]


def tilt(platform, direction):
    next_platform = [[cell if cell == "#" else "." for cell in row] for row in platform]

    rows = len(platform)
    cols = len(platform[0])
    row_range = range(rows - 1, -1, -1) if direction == "S" else range(rows)
    col_range = range(cols - 1, -1, -1) if direction == "E" else range(cols)

    for row in row_range:
        for col in col_range:
            if platform[row][col] == "O":
                coord = [row, col]
                next_row, next_col = next_coord((row, col), direction)
                while (
                    0 <= next_row < len(platform)
                    and 0 <= next_col < len(platform[0])
                    and next_platform[next_row][next_col] == "."
                ):
                    coord = [next_row, next_col]
                    next_row, next_col = next_coord((next_row, next_col), direction)
                next_platform[coord[0]][coord[1]] = "O"
    return next_platform


def calculate_load(platform):
    load = 0
    for row in range(len(platform)):
        value = len(platform) - row
        load += value * platform[row].count("O")
    return load


def solve(input):
    # Part 1
    platform = tilt(split_platform(input), "N")
    print("Part 1: ", calculate_load(platform))

    # Part 2
    platform = input
    cached_platforms = {}

    cycles = 1_000_000_000
    for _ in range(cycles):
        if platform in cached_platforms:
            platform = cached_platforms[platform]
        else:
            from_platform = platform
            platform = split_platform(platform)

            for direction in ["N", "W", "S", "E"]:
                platform = tilt(platform, direction)
            platform = join_platform(platform)
            cached_platforms[from_platform] = platform

    print("Part 2: ", calculate_load(split_platform(platform)))


def split_platform(platform):
    return [list(row) for row in platform.split("\n")]


def join_platform(platform):
    return "\n".join(["".join(row) for row in platform])


solve(input)
