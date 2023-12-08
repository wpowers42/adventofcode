from math import prod

example = [(7, 9), (15, 40), (30, 200)]
input = [(49, 263), (97, 1532), (94, 1378), (94, 1851)]


def calculate_distance(start_ms, end_ms):
    speed = start_ms
    distance = (end_ms - start_ms) * speed
    return distance


def solve(races):
    outcomes = []
    for race in races:
        end_ms, record = race
        for start_ms in range(end_ms):
            if calculate_distance(start_ms, end_ms) > record:
                start_index = start_ms
                break
        for start_ms in range(end_ms, 0, -1):
            if calculate_distance(start_ms, end_ms) > record:
                end_index = start_ms
                break
        outcomes.append(end_index - start_index + 1)

    return prod(outcomes)


print("Part 1:", solve(input))
print("Part 2:", solve([(49979494, 263153213781851)]))
