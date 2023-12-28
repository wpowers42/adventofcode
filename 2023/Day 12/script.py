import re


def pattern(condition: tuple) -> re.Pattern:
    # condition is a tuple of ints like (1, 1, 3)
    # return a pattern for this example would be \.?#{1}\.+#{1}\.+#{3}\.?

    # make a pattern for any condition provided in the form of a tuple
    return re.compile(
        "(\\.+)?" + "\\.+".join(["#" * num for num in condition]) + "(\\.+)?"
    )


def possible_pattern(condition: tuple) -> re.Pattern:
    return re.compile(
        "([.?]+)?"
        + "[.?]+".join(["[#?]{" + str(num) + "}" for num in condition])
        + "([.?]+)?"
    )


def is_possibly_valid(pattern: re.Pattern, configuration: str) -> bool:
    # configuration is a string like ".#...#....###"
    # return True if the configuration is valid, False otherwise
    return pattern.match(configuration) is not None


def is_complete(configuration: str) -> bool:
    return configuration.count("?") == 0


def is_valid(pattern: re.Pattern, configuration: str) -> bool:
    # configuration is a string like ".#...#....###"
    # return True if the configuration is valid, False otherwise
    return pattern.match(configuration) is not None


def solve_line(springs: str, condition: str, repeat: int = 1):
    springs = "?".join([springs for _ in range(repeat)])
    condition = ",".join([condition for _ in range(repeat)])
    condition = tuple(map(int, condition.split(",")))

    context = {
        "target_num_damaged": sum(condition),
        # "valid": set(),
        "num_valid": 0,
        "target_pattern": pattern(condition),
        "possible_pattern": possible_pattern(condition),
        "unknown_indices": [i for i, x in enumerate(springs) if x == "?"],
    }

    # print(context["possible_pattern"].pattern)

    recursive(springs, springs.count("#"), springs.count("?"), 0, context)
    print("Valid:", context["num_valid"])
    return context["num_valid"]


def recursive(springs, num_damaged_known, num_unknown, unknown_index, context):
    target_num_damaged = context["target_num_damaged"]
    # valid = context["valid"]
    target_pattern = context["target_pattern"]
    possible_pattern = context["possible_pattern"]
    unknown_indices = context["unknown_indices"]

    if num_damaged_known > target_num_damaged:
        return

    if num_damaged_known + num_unknown < target_num_damaged:
        return

    if num_unknown == 0:
        if is_valid(target_pattern, springs):
            # valid.add(springs)
            context["num_valid"] += 1
        return

    if not is_possibly_valid(possible_pattern, springs):
        # print("not possible", springs)
        return

    index = unknown_indices[unknown_index]
    recursive(
        springs[:index] + "#" + springs[index + 1 :],
        num_damaged_known + 1,
        num_unknown - 1,
        unknown_index + 1,
        context,
    )
    recursive(
        springs[:index] + "." + springs[index + 1 :],
        num_damaged_known,
        num_unknown - 1,
        unknown_index + 1,
        context,
    )


from multiprocessing import Pool


def main():
    debug = False
    file = "example.txt" if debug else "input.txt"
    with open(file) as f:
        input = f.read()

    records = [record.split(" ") for record in input.split("\n")]

    # Part 1
    total = 0
    for springs, condition in records:
        total += solve_line(springs, condition, 1)
    print("Part 1:", total)

    # Part 2
    # total = 0
    # index = 0
    # for springs, condition in records[:10]:
    #     print(index, springs, condition)
    #     index += 1
    #     a = solve_line(springs, condition, 1)
    #     b = solve_line(springs, condition, 2)
    #     num_possible = a * (b / a) ** 4
    #
    #     total += num_possible
    # print("Part 2:", total)

    # Use multiprocessing
    total = 0
    with Pool() as pool:  # Adjust the number of processes as needed
        queue = []
        for springs, condition in records:
            a = solve_line(springs, condition, 1)
            b = solve_line(springs, condition, 2)

            if (b / a).is_integer():
                num_possible = a * (b / a) ** 4
                total += num_possible
            else:
                queue.append((springs, condition))

        print(f"Starting multiprocessing with {len(queue)} records...")
        results = [
            pool.apply_async(solve_line, (springs, condition, 5))
            for springs, condition in queue
        ]

        for index, result in enumerate(results):
            try:
                num_possible = result.get()
                total += num_possible
            except Exception as exc:
                print(f"An exception occurred: {exc}")

    print("Total:", total)


if __name__ == "__main__":
    main()
