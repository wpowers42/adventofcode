import heapq

with open("input.txt") as f:
    input = f.read()


with open("example.txt") as f:
    example = f.read()


def heuristic(a, b):
    return (abs(a[0] - b[0]) + abs(a[1] - b[1])) * 0


def astar(grid, start, end):
    rows, cols = len(grid), len(grid[0])
    open_set = []
    # f_score, g_score, node
    heapq.heappush(open_set, (heuristic(start, end), 0, start))
    came_from = {}
    g_score = {start: 0}

    def get_trail(comet, graph):
        trail = [comet]
        while comet in graph and len(trail) < 4:
            trail.append(graph[comet])
            comet = graph[comet]
        return trail

    def get_direction(trail):
        direction, must_turn = None, False
        if len(trail) < 2:
            pass
        elif len(trail) < 4:
            direction = (trail[0][0] - trail[1][0], trail[0][1] - trail[1][1])
            must_turn = False
        else:
            direction = (trail[0][0] - trail[1][0], trail[0][1] - trail[1][1])
            direction2 = (trail[1][0] - trail[2][0], trail[1][1] - trail[2][1])
            direction3 = (trail[2][0] - trail[3][0], trail[2][1] - trail[3][1])
            must_turn = direction == direction2 == direction3

        return direction, must_turn

    while open_set:
        current = heapq.heappop(open_set)[2]

        if current == end:
            path = []
            print(get_trail(current, came_from))
            while current in came_from:
                path.append(current)
                current = came_from[current]
            # reverse the path
            return path[::-1]

        direction, must_turn = get_direction(get_trail(current, came_from))
        if direction is None:
            # we are at the start, can go east or south
            directions = [(0, 1), (1, 0)]
            # directions = [(1, 0)]
        else:
            # we can always go left or right, but we can't go back
            flipped = (direction[1], direction[0])
            directions = [flipped, (-flipped[0], -flipped[1])]

            if not must_turn:
                directions.append(direction)

        for dx, dy in directions:
            neighbor = (current[0] + dx, current[1] + dy)
            # print((dx, dy), neighbor)
            if 0 <= neighbor[0] < cols and 0 <= neighbor[1] < rows:
                tentative_g_score = g_score[current] + grid[neighbor[1]][neighbor[0]]
                # Does this need to be less than or less than or equal to?
                if neighbor not in g_score or tentative_g_score < g_score[neighbor]:
                    g_score[neighbor] = tentative_g_score
                    f_score = tentative_g_score + heuristic(neighbor, end)
                    heapq.heappush(open_set, (f_score, tentative_g_score, neighbor))
                    came_from[neighbor] = current

        print(open_set)

    return None


def main():
    grid = [[int(cell) for cell in row] for row in example.split("\n")]
    for y, row in enumerate(grid):
        for x, cell in enumerate(row):
            print(cell, end="")
        print()

    # Reminder, I will use (x, y) coordinates
    path = astar(grid, (0, 0), (len(grid[0]) - 1, len(grid) - 1))
    # pretty print the path for debugging
    path = set(path)
    cost_of_path = sum(grid[y][x] for x, y in path)
    print(cost_of_path)
    for y, row in enumerate(grid):
        for x, cell in enumerate(row):
            if (x, y) in path:
                print("O", end="")
            else:
                print(cell, end="")
        print()


if __name__ == "__main__":
    main()
