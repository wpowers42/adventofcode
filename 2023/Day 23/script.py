from collections import deque

with open("input.txt") as f:
    input = f.read()


with open("example.txt") as f:
    example = f.read()


def main(trails, part=1):
    tiles = {}
    for y, row in enumerate(trails.split("\n")):
        for x, c in enumerate(row):
            tiles[(x, y)] = {"material": c}

    for x, y in tiles:
        material = tiles[(x, y)]["material"]
        slopes = dict({"^": (0, -1), ">": (1, 0), "v": (0, 1), "<": (-1, 0)})
        if material == "#":
            continue
        elif material == "." or part == 2:
            neighbors = {(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)}
        else:
            dx, dy = slopes[material]
            neighbors = {(x + dx, y + dy)}

        for neighbor in neighbors.copy():
            if neighbor not in tiles:
                neighbors.remove(neighbor)
                continue

            neighbor_material = tiles[neighbor]["material"]
            if neighbor_material == "#":
                neighbors.remove(neighbor)
            elif neighbor_material == "." or part == 2:
                # do nothing
                pass
            else:
                nx, ny = neighbor
                dx, dy = slopes[neighbor_material]
                if (x, y) == (nx + dx, ny + dy):
                    # can't travel uphill on ice. not sure if this is needed.
                    neighbors.remove(neighbor)
        tiles[(x, y)]["neighbors"] = frozenset(neighbors)

    start = (1, 0)
    end = max([key for key, values in tiles.items() if values["material"] == "."])

    frontier = deque([(start, frozenset())])
    explored = set()
    solutions = set()
    while frontier and part == 1:
        (x, y), path = frontier.popleft()
        if (x, y, path) in explored:
            # we've followed this path before
            continue

        neighbors = tiles[(x, y)]["neighbors"].difference(path)
        for neighbor in neighbors:
            frontier.append((neighbor, frozenset(path.union({(x, y)}))))

        if (x, y) == end:
            solutions.add(frozenset(path.union({(x, y)})))

    if part == 1:
        print(f"Part {part}: {max((len(solution) for solution in solutions)) - 1}")
        return

    # frontier will be the nodes that fork
    frontier = deque([start])
    visited = set()
    graph = {}
    forks = set(start)

    while frontier:
        x, y = frontier.popleft()
        visited.add((x, y))
        for neighbor in list(tiles[(x, y)]["neighbors"].difference(visited)):
            distance = 0
            queue = deque([neighbor])
            while queue:
                distance += 1
                node = queue.popleft()
                visited.add(node)
                if node == end or node in graph:
                    graph[(x, y), node] = distance
                    break

                neighbors = set(tiles[node]["neighbors"].difference(visited))
                if len(neighbors) > 1:
                    frontier.append(node)
                    forks.add(node)
                    graph[(x, y), node] = distance
                elif len(neighbors) == 1:
                    queue.append(neighbors.pop())
                else:
                    # check if we looped back around and hit a node we already visited
                    for neighbor in tiles[node]["neighbors"]:
                        if neighbor in forks:
                            graph[(x, y), neighbor] = distance + 1

    # Actually find the longest path using simplified graph
    graph = build_graph(graph.items())
    all_paths = find_all_paths(graph, start, end)
    longest_path = max(all_paths, key=lambda x: x[1], default=(None, 0))
    print(f"Part 2: {longest_path[1]}")


def build_graph(pairs):
    graph = {}
    for (node1, node2), distance in pairs:
        graph.setdefault(node1, []).append((node2, distance))
        graph.setdefault(node2, []).append((node1, distance))
    return graph


def find_all_paths(graph, start, end, path=None, total_distance=0):
    if path is None:
        path = set()

    path.add(start)
    if start == end:
        return [(path, total_distance)]

    paths = []

    for node, distance in graph[start]:
        if node not in path:  # Prevent revisiting the same node
            newpaths = find_all_paths(
                graph, node, end, path.copy(), total_distance + distance
            )
            for newpath in newpaths:
                paths.append(newpath)

    return paths


if __name__ == "__main__":
    main(input)
    main(input, 2)
