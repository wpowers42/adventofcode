import os

dir = os.path.dirname(os.path.realpath(__file__))

input = """0 3 6 9 12 15
1 3 6 10 15 21
10 13 16 21 30 45"""

with open(os.path.join(dir, "./input.txt"), "r") as f:
    input = f.read()

part_1 = 0
part_2 = 0

for line in input.split("\n"):
    line = [int(n) for n in line.split(" ")]
    stack = []
    while any([n != 0 for n in line]):
        stack.append([0] + line + [0])
        line = [line[i + 1] - line[i] for i in range(len(line) - 1)]
    stack.append([0] + line + [0])
    stack.reverse()
    for i in range(len(stack) - 1):
        stack[i + 1][-1] = stack[i + 1][-2] + stack[i][-1]
        stack[i + 1][0] = stack[i + 1][1] - stack[i][0]
    part_1 += stack[-1][-1]
    part_2 += stack[-1][0]

print("Part 1:", part_1)
print("Part 2:", part_2)
