example = """#.##..##.
..#.##.#.
##......#
##......#
..#.##.#.
..##..##.
#.#.##.#.

#...##..#
#....#..#
..##..###
#####.##.
#####.##.
..##..###
#....#..#"""


def solve(input, tolerance):
    patterns = [pattern.split("\n") for pattern in input.split("\n\n")]
    results = [find_symmetry(pattern, tolerance) for pattern in patterns]
    return sum(results)


def slice_string(string, index):
    # return two strings, one on either side of the index
    target_length = min(index, len(string) - index)
    first = string[index - target_length : index]
    second = string[index : index + target_length]

    return first, second[::-1]


def compare_strings(string1, string2):
    # return the number of differences between two strings
    return sum(1 for a, b in zip(string1, string2) if a != b)


def find_symmetry(pattern, tolerance):
    def _find_symmetry(_pattern):
        for index in range(1, len(_pattern[0])):
            if (
                sum([compare_strings(*slice_string(row, index)) for row in _pattern])
                == tolerance
            ):
                return index

    if _find_symmetry(pattern):
        return _find_symmetry(pattern)
    else:
        # rotate the pattern 270 degrees to compare across rows
        pattern = ["".join(row) for row in zip(*pattern[::-1])]
        pattern = ["".join(row) for row in zip(*pattern[::-1])]
        pattern = ["".join(row) for row in zip(*pattern[::-1])]

        return _find_symmetry(pattern) * 100


with open("input.txt") as f:
    input = f.read()

print("Part 1: ", solve(input, 0))
print("Part 2: ", solve(input, 1))
