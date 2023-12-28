from shapely import Polygon, area, length

with open("input.txt") as f:
    input = f.read()


with open("example.txt") as f:
    example = f.read()


dirs = {"R": (1, 0), "D": (0, 1), "L": (-1, 0), "U": (0, -1)}


def main():
    plan = input

    # Part 1
    boundary = []
    x, y = (0, 0)
    boundary.append((x, y))
    for step in plan.split("\n"):
        direction, meters, _ = step.split(" ")
        for _ in range(int(meters)):
            x += dirs[direction][0]
            y += dirs[direction][1]
            boundary.append((x, y))
    interior = flood_fill((1, 1), boundary)
    print("Part 1:", len(interior | set(boundary)))

    # Part 2
    boundary = list()
    perimeter = 0
    x, y = (0, 0)
    for step in plan.split("\n"):
        _, _, color = step.split(" ")
        meters = int(color[2:7], 16)
        perimeter += meters
        direction = list(dirs.values())[int(color[7])]

        x += direction[0] * meters
        y += direction[1] * meters
        boundary.append((x, y))

    # Flood-fill is too inefficient so using external library here.
    # I wasn't able to get a scanline approach to work, though not
    # sure if that would be fast enough.
    polygon = Polygon(list(boundary))

    # I have no idea why the extra math on length() is needed. I derived it
    # by trial and error. I thought simply area() OR area() + length()
    # would be enough.
    print("Part 2 (shapely):", area(polygon) + length(polygon) / 2 + 1)

    print("Part 2 (shoelace):", shoelace(boundary) + perimeter / 2 + 1)


def shoelace(boundary):
    area = 0
    for i in range(len(boundary)):
        x1, y1 = boundary[i]
        x2, y2 = boundary[(i + 1) % len(boundary)]
        area += x1 * y2 - x2 * y1

        # Interestingly, I initially had this typo that was giving the
        # correct result without need to divide by 2:
        # area += x1 * y2 - x2 * y2
    return area / 2


def flood_fill(node, boundary):
    boundary = set(boundary)
    queue = []
    interior = set()
    queue.append(node)
    while len(queue) > 0:
        n = queue.pop()
        if n not in boundary and n not in interior:
            interior.add(n)
            queue += [(n[0] + d[0], n[1] + d[1]) for d in dirs.values()]
    return interior


if __name__ == "__main__":
    main()
