with open("input.txt") as f:
    input = f.read()


with open("example.txt") as f:
    example = f.read()


def create_rulebook(workflows):
    rulebook = {}
    for workflow in workflows.split("\n"):
        name, rules = workflow.split("{")
        rulebook[name] = []
        rules = [rule.split(":") for rule in rules[:-1].split(",")]
        for rule in rules:
            if len(rule) == 2:
                rule = {
                    "type": "conditional",
                    "variable": rule[0][0],
                    "operator": rule[0][1],
                    "value": int(rule[0][2:]),
                    "assignment": rule[1],
                }
                rulebook[name].append(rule)
            else:
                rule = {
                    "type": "default",
                    "assignment": rule[0],
                }
                rulebook[name].append(rule)
    return rulebook


def create_part_list(parts):
    part_list = []
    for part in parts.split("\n"):
        part_list.append(
            {attribute[0]: int(attribute[2:]) for attribute in part[1:-1].split(",")}
        )
    return part_list


def process_part(part, rulebook):
    step = "in"
    while step not in {"A", "R"}:
        workflow = rulebook[step]
        for rule in workflow:
            if rule["type"] == "default":
                step = rule["assignment"]
                break
            else:
                value = rule["value"]
                part_value = part[rule["variable"]]
                if rule["operator"] == "<" and part_value < value:
                    step = rule["assignment"]
                    break
                elif rule["operator"] == ">" and part_value > value:
                    step = rule["assignment"]
                    break
                else:
                    continue
    return step


def process_generic_part(part, rulebook):
    step = part["step"]
    workflow = rulebook[step]
    parts = []
    for rule in workflow:
        if rule["type"] == "default":
            part["step"] = rule["assignment"]
            parts.append(part)
            break
        else:
            value = rule["value"]
            value_low, value_high = part[rule["variable"]]
            if value_low >= value or value_high <= value:
                # rule doesn't apply
                continue
            else:
                # need to split into matches and not matches
                if rule["operator"] == "<":
                    low = part.copy()
                    low[rule["variable"]] = (value_low, value - 1)
                    low["step"] = rule["assignment"]
                    parts.append(low)
                    part[rule["variable"]] = (value, value_high)
                elif rule["operator"] == ">":
                    high = part.copy()
                    high[rule["variable"]] = (value + 1, value_high)
                    high["step"] = rule["assignment"]
                    part[rule["variable"]] = (value_low, value)
                    parts.append(high)
                else:
                    continue

    return parts


def main(system):
    workflows, parts = system.split("\n\n")
    rulebook = create_rulebook(workflows)
    part_list = create_part_list(parts)

    total = sum(
        [
            sum(part.values())
            for part in part_list
            if process_part(part, rulebook) == "A"
        ]
    )
    print("Part 1:", total)

    # Part 2
    queue = []
    final = []
    part = {
        "step": "in",
        "x": (1, 4000),
        "m": (1, 4000),
        "a": (1, 4000),
        "s": (1, 4000),
    }
    queue.append(part)

    while len(queue) > 0:
        part = queue.pop()
        parts = process_generic_part(part, rulebook)
        for part in parts:
            if part["step"] in {"A", "R"}:
                final.append(part)
            else:
                queue.append(part)

    total = 0
    for result in final:
        if result["step"] == "A":
            x = result["x"][1] - result["x"][0] + 1
            m = result["m"][1] - result["m"][0] + 1
            a = result["a"][1] - result["a"][0] + 1
            s = result["s"][1] - result["s"][0] + 1

            total += x * m * a * s

    print("Part 2:", total)


if __name__ == "__main__":
    main(input)
