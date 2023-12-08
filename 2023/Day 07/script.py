import os
from collections import Counter
from itertools import combinations_with_replacement

dir = os.path.dirname(os.path.realpath(__file__))

example = """32T3K 765
T55J5 684
KK677 28
KTJJT 220
QQQJA 483"""


def hand_type(hand):
    freqs = Counter(hand).most_common(5)

    if freqs[0][1] == 5:
        return 6
    elif freqs[0][1] == 4:
        return 5
    elif freqs[0][1] == 3 and freqs[1][1] == 2:
        return 4
    elif freqs[0][1] == 3:
        return 3
    elif freqs[0][1] == 2 and freqs[1][1] == 2:
        return 2
    elif freqs[0][1] == 2:
        return 1
    else:
        return 0


with open(os.path.join(dir, "./input.txt"), "r") as f:
    example = f.read()


def solve(input, part):
    card_rank = "23456789TJQKA" if part == 1 else "J23456789TQKA"
    hands = []

    for line in input.split("\n"):
        hand, bid = line.split(" ")
        type = hand_type(hand)

        if part == 2 and "J" in hand:
            base_hand = hand.replace("J", "")
            for comb in combinations_with_replacement(card_rank, 5 - len(base_hand)):
                type = max(type, hand_type(base_hand + "".join(comb)))

        hands.append([type, [card_rank.index(card) for card in hand], bid])

    hands.sort(key=lambda x: (x[0], x[1]), reverse=False)
    return sum([(index + 1) * int(hand[2]) for index, hand in enumerate(hands)])


print("Part 1:", solve(example, 1))
print("Part 2:", solve(example, 2))
