from itertools import permutations, combinations


def main():
    debug = True
    file = "example.txt" if debug else "input.txt"
    with open(file) as f:
        input = f.read()

    records = [record.split(" ") for record in input.split("\n")]

    # Part 1
    total = 0
    for index, (spring, condition) in enumerate(records):
        spring = list(spring)
        num_possible = possible_springs(spring, condition)
        total += num_possible
    print("Part 1:", total)

    # Part 2 - will never finish, need to find a better way
    total = 0
    for index, (spring, condition) in enumerate(records):
        spring = list(spring)
        print(index)
        spring = list("?".join(["".join(spring) for _ in range(5)]))
        condition = ",".join([condition for _ in range(5)])
        num_possible = possible_springs(spring, condition)
        total += num_possible
    print("Part 2:", total)


def possible_springs(springs, condition):
    num_damaged = sum(map(int, condition.split(",")))
    num_damaged_known = springs.count("#")
    num_damaged_to_place = num_damaged - num_damaged_known

    unknown_indices = [i for i, x in enumerate(springs) if x == "?"]
    damaged_placements = combinations(unknown_indices, num_damaged_to_place)

    num_possible = 0
    for placement in damaged_placements:
        springs_list = springs.copy()
        for index in placement:
            springs_list[index] = "#"
        for index in unknown_indices:
            if springs_list[index] == "?":
                springs_list[index] = "."
        if validate(springs_list, condition):
            num_possible += 1
    return num_possible


def validate(springs, condition):
    counter = 0
    result = []
    for char in springs:
        if char == "#":
            counter += 1
        elif char == "." and counter != 0:
            result.append(counter)
            counter = 0
    if counter != 0:
        result.append(counter)

    result = tuple(result)

    condition = tuple(map(int, condition.split(",")))
    return result == condition


if __name__ == "__main__":
    main()
