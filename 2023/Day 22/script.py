from copy import deepcopy

with open("input.txt") as f:
    input = f.read()


with open("example.txt") as f:
    example = f.read()


def create_brick(position):
    brick = list(zip(*[side.split(",") for side in position.split("~")]))
    brick = [tuple(map(int, pair)) for pair in brick]
    x1, x2 = brick[0]
    y1, y2 = brick[1]
    z1, z2 = brick[2]
    brick = set()
    for x in range(x1, x2 + 1):
        for y in range(y1, y2 + 1):
            for z in range(z1, z2 + 1):
                brick.add((x, y, z))
    return brick


def is_on_bottom(brick):
    return min(brick, key=lambda b: b[2])[2] == 1


def main(snapshot):
    bricks = []
    for position in snapshot.split("\n"):
        bricks.append(create_brick(position))
    voxels = {cube for brick in bricks for cube in brick}

    # sort bricks from lowest to highest
    bricks.sort(key=lambda b: min(c[2] for c in b))

    # settle all bricks
    for ix, brick in enumerate(bricks):
        voxels = voxels.difference(brick)

        # find highest point brick will touch
        max_z = 1  # on floor
        for x, y, z in brick:
            while (x, y, z - 1) not in voxels and z > 1:
                z = z - 1
            max_z = max(max_z, z)

        delta = min(brick, key=lambda b: b[2])[2] - max_z

        bricks[ix] = {(x, y, z - delta) for (x, y, z) in brick}
        voxels = voxels.union(bricks[ix])

    support_structure = {i: set() for i in range(len(bricks))}
    for ix, brick in enumerate(bricks):
        new_brick = {(x, y, z - 1) for (x, y, z) in brick}
        for other_ix, other_brick in enumerate(bricks):
            if other_ix == ix:
                continue
            elif len(new_brick.intersection(other_brick)) > 0:
                support_structure[ix].add(other_ix)
    # start with all keys. remove those that show up as single support
    results = {i for i in range(len(bricks))}

    for k, v in support_structure.items():
        if len(v) == 1:
            results = results - v

    print(f"Part 1: {len(results)}")

    results = {i: 0 for i in range(len(bricks))}
    r = []
    for i in results:
        queue = [i]
        ss = deepcopy(support_structure)
        num_f = 0
        while queue:
            node = queue.pop(0)
            # eliminate from ss keys
            # remove from ss values
            # if no ss value is 0, add to queue
            del ss[node]
            for k, v in ss.items():
                if node in v:
                    ss[k].remove(node)
                    if len(ss[k]) == 0:
                        queue.append(k)
                        num_f += 1

        r.append(num_f)

    print(f"Part 2: {sum(r)}")


if __name__ == "__main__":
    main(input)
