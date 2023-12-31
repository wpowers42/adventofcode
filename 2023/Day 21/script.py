from collections import deque

with open("input.txt") as f:
    input = f.read()


with open("example.txt") as f:
    example = f.read()


def main(garden):
    garden = create_garden(garden)
    start = [
        (x, y, 0) for y, row in enumerate(garden) for x, c in enumerate(row) if c == "S"
    ][0]
    garden[start[1]][start[0]] = "."
    garden = flood_fill(garden, start, 64)
    print("Part 1:", sum(row.count("O") for row in garden))


def create_garden(garden):
    garden = list(map(list, garden.split("\n")))
    return garden


def flood_fill(garden, start, target_steps):
    queue = deque([start])
    visited = set()
    while len(queue) > 0:
        x, y, steps = queue.popleft()
        if (x, y, steps) in visited:
            continue
        else:
            visited.add((x, y, steps))
        if garden[y][x] == "." and steps <= target_steps:
            if steps == target_steps:
                garden[y][x] = "O"
            neighbors = [(x, y - 1), (x, y + 1), (x - 1, y), (x + 1, y)]
            for x, y in neighbors:
                if x < 0 or x >= len(garden[0]) or y < 0 or y >= len(garden):
                    continue
                queue.append((x, y, steps + 1))
    return garden


if __name__ == "__main__":
    main(input)
