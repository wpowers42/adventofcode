import os
from collections import Counter

dir = os.path.dirname(os.path.realpath(__file__))

example = """..F7.
.FJ|.
SJ.L7
|F--J
LJ..."""

UP = (-1, 0)
DOWN = (1, 0)
LEFT = (0, -1)
RIGHT = (0, 1)
ZERO = (0, 0)

DIRECTIONS = [UP, DOWN, LEFT, RIGHT]

instructions = {
    "F": {UP: RIGHT, LEFT: DOWN},
    "J": {RIGHT: UP, DOWN: LEFT},
    "7": {RIGHT: DOWN, UP: LEFT},
    "L": {LEFT: UP, DOWN: RIGHT},
    "|": {UP: UP, DOWN: DOWN},
    "-": {LEFT: LEFT, RIGHT: RIGHT},
    ".": {},
    "S": {UP: ZERO, DOWN: ZERO, LEFT: ZERO, RIGHT: ZERO},
}

lefts = {
    UP: LEFT,
    LEFT: DOWN,
    DOWN: RIGHT,
    RIGHT: UP,
}

rights = {
    UP: RIGHT,
    RIGHT: DOWN,
    DOWN: LEFT,
    LEFT: UP,
}


def get_tile(coords, input):
    y, x = coords
    if (y < 0) or (y >= len(input)):
        return None
    if (x < 0) or (x >= len(input[y])):
        return None
    return input[y][x]


def solve(input):
    input = [list(row) for row in input.split("\n")]

    # Find start
    for y, row in enumerate(input):
        for x, char in enumerate(row):
            if char == "S":
                start = (y, x)
                break

    # Take a step in any valid direction
    for direction in DIRECTIONS:
        coords = (direction[0] + start[0], direction[1] + start[1])
        tile = get_tile(coords, input)
        if tile is not None:
            if direction in instructions[tile].keys():
                # Just pick the first one
                break

    # Creat an empty map of the pipe network
    pipe_map = [[0 for _ in range(len(input[0]))] for _ in range(len(input))]
    pipe_map[start[0]][start[1]] = "."
    pipe_map[coords[0]][coords[1]] = "."

    # Follow the pipe network
    moves = 1
    while coords != start:
        moves += 1
        direction = instructions[tile][direction]
        coords = (coords[0] + direction[0], coords[1] + direction[1])
        tile = get_tile(coords, input)
        pipe_map[coords[0]][coords[1]] = "."

        # mark the tile to the left of the current tile relative to the direction as L, if it exists
        left_coords = (
            coords[0] + lefts[direction][0],
            coords[1] + lefts[direction][1],
        )
        left_tile = get_tile(left_coords, input)
        if left_tile is not None and pipe_map[left_coords[0]][left_coords[1]] != ".":
            pipe_map[left_coords[0]][left_coords[1]] = "L"

        # mark the tile to the right of the current tile relative to the direction as R, if it exists
        right_coords = (
            coords[0] + rights[direction][0],
            coords[1] + rights[direction][1],
        )
        right_tile = get_tile(right_coords, input)
        if right_tile is not None and pipe_map[right_coords[0]][right_coords[1]] != ".":
            pipe_map[right_coords[0]][right_coords[1]] = "R"

        up_coords = (coords[0] + UP[0], coords[1] + UP[1])
        if direction == UP and get_tile(up_coords, input) is not None:
            if tile in ("7", "F") and pipe_map[up_coords[0]][up_coords[1]] != ".":
                pipe_map[up_coords[0]][up_coords[1]] = "R" if tile == "7" else "L"

        down_coords = (coords[0] + DOWN[0], coords[1] + DOWN[1])
        if direction == DOWN and get_tile(down_coords, input) is not None:
            if tile in ("J", "L") and pipe_map[down_coords[0]][down_coords[1]] != ".":
                pipe_map[down_coords[0]][down_coords[1]] = "R" if tile == "L" else "L"

    # flood fill
    queue = [
        (y, x, pipe_map[y][x])
        for x in range(len(pipe_map[0]))
        for y in range(len(pipe_map))
        if pipe_map[y][x] in ("L", "R")
    ]

    while len(queue) > 0:
        y, x, c = queue.pop(0)
        tile = get_tile((y, x), pipe_map)

        if tile != ".":
            pipe_map[y][x] = c
            queue.extend(
                filter(
                    lambda x: get_tile((x[0], x[1]), pipe_map) == 0
                    and queue.count(x) == 0,
                    [
                        (y - 1, x, c),
                        (y + 1, x, c),
                        (y, x - 1, c),
                        (y, x + 1, c),
                    ],
                ),
            )

    print("\n" + "\n".join(["".join([str(tile) for tile in row]) for row in pipe_map]))

    counter = Counter(
        "".join(["".join([str(tile) for tile in row]) for row in pipe_map])
    )

    print("Part 1:", moves // 2)
    print("Part 2:", counter)


with open(os.path.join(dir, "./input.txt"), "r") as f:
    input = f.read()

# solve(example)
solve(input)
