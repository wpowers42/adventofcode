import os
import re

dir = os.path.dirname(os.path.realpath(__file__))

input = """Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue
Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red
Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red
Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green"""


with open(os.path.join(dir, "./input.txt"), "r") as f:
    input = f.read()

part1 = 0
part2 = 0

for game_number, game in enumerate(input.split("\n")):
    matches = re.findall("\d+ \w+", game)
    is_valid = True

    min_per_color = {"blue": 0, "green": 0, "red": 0}

    for match in matches:
        number, color = match.split(" ")
        number = int(number)
        if color == "blue" and number > 14:
            is_valid = False
        elif color == "green" and number > 13:
            is_valid = False
        elif color == "red" and number > 12:
            is_valid = False

        if number > min_per_color[color]:
            min_per_color[color] = number

    if is_valid:
        part1 += int(game_number) + 1
    part2 += min_per_color["blue"] * min_per_color["green"] * min_per_color["red"]

print("Part 1:", part1)
print("Part 2:", part2)
