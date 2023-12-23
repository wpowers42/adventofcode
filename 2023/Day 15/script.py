with open("input.txt") as f:
    input = f.read()


# input = "rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7"


# Part 1
def hash_algorithm(chars):
    value = 0
    for char in chars:
        value += ord(char)
        value *= 17
        value %= 256
    return value


total = 0
for instructions in input.split(","):
    total += hash_algorithm(instructions)

print("Part 1: ", total)


# Part 2
boxes = [[] for _ in range(256)]
for instructions in input.split(","):
    if "=" in instructions:
        chars, focal_length, instruction = instructions.split("=") + ["="]
    else:
        chars, focal_length, instruction = instructions.split("-") + ["-"]
    box = hash_algorithm(chars)
    added = False
    for index, lens in enumerate(boxes[box]):
        if lens[0] == chars and instruction == "=":
            boxes[box][index][1] = focal_length
            added = True
            break
        elif lens[0] == chars and instruction == "-":
            del boxes[box][index]
            break
    if instruction == "=" and not added:
        boxes[box].append([chars, focal_length])

total = 0
for box_index, box in enumerate(boxes):
    for lens_index, lens in enumerate(box):
        total += (box_index + 1) * (lens_index + 1) * int(lens[1])

print("Part 2: ", total)
