import os
import re

dir = os.path.dirname(os.path.realpath(__file__))

input = """Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53
Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19
Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1
Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83
Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36
Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11"""


def solution(input, part):
    cards = input.split("\n")
    results = []
    for index, card in enumerate(cards):
        winners, draws = [re.findall("\d+", column) for column in card.split(" | ")]
        results.append((index, len(set(winners[1:]).intersection(set(draws)))))

    if part == 1:
        return sum([2 ** (result[1] - 1) for result in results if result[1] > 0])

    scratchcards = 0
    while len(results) > scratchcards:
        index, value = results[scratchcards]
        scratchcards += 1
        for n in range(value):
            results.append(results[index + n + 1])
    return scratchcards


with open(os.path.join(dir, "./input.txt"), "r") as f:
    input = f.read()

print("Part 1:", solution(input, 1))
print("Part 2:", solution(input, 2))
