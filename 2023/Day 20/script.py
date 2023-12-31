from collections import Counter, deque, defaultdict
from enum import Enum

with open("input.txt") as f:
    input = f.read()


with open("example.txt") as f:
    example = f.read()


def create_graph(modules):
    graph = {}
    sources = {}

    for edges in modules.split("\n"):
        source, destinations = edges.split(" -> ")

        if source == "broadcaster":
            module, name, pulse = (
                Module.broadcaster,
                "broadcaster",
                Pulse.LOW,
            )
        else:
            module, name, pulse = (
                Module.flip_flop if source[0] == "%" else Module.conjunction,
                source[1:],
                Pulse.LOW,
            )
        destinations = destinations.split(", ")
        graph[name] = {"module": module, "destinations": destinations, "pulse": pulse}
        for destination in destinations:
            if destination not in sources:
                sources[destination] = set()
            sources[destination].add(name)

    for node in graph:
        if graph[node]["module"] == Module.conjunction:
            graph[node]["memory"] = {source: Pulse.LOW for source in sources[node]}

    return graph


class Module(Enum):
    broadcaster = 0
    flip_flop = 1
    conjunction = 2


class Pulse(Enum):
    LOW = False
    HIGH = True


PULSE_FLIP = {Pulse.LOW: Pulse.HIGH, Pulse.HIGH: Pulse.LOW}


def main(modules):
    graph = create_graph(modules)
    pulses = []
    observed_modules = defaultdict(list)

    cycle_information_collected = False
    button_press = 0
    while not cycle_information_collected:
        button_press += 1
        if button_press <= 1_000:
            pulses.append(Pulse.LOW)  # Push button
        queue = deque(
            [
                [
                    ("broadcaster", destination, Pulse.LOW)
                    for destination in graph["broadcaster"]["destinations"]
                ]
            ]
        )
        while len(queue) > 0:
            sent = queue.popleft()
            pending = []
            for source, target, pulse in sent:
                # Track for Part 1
                if button_press <= 1_000:
                    pulses.append(pulse)
                # Track for Part 2
                if target == "hj" and pulse == Pulse.HIGH:
                    observed_modules[source].append(button_press)
                    if all(len(observed_modules[key]) >= 2 for key in observed_modules):
                        cycle_information_collected = True
                if target not in graph:
                    continue
                module = graph[target]["module"]
                if module == Module.flip_flop and pulse == Pulse.HIGH:
                    # No op
                    continue
                elif module == Module.flip_flop and pulse == Pulse.LOW:
                    graph[target]["pulse"] = PULSE_FLIP[graph[target]["pulse"]]
                    # send pulse to all destination modules
                    for destination in graph[target]["destinations"]:
                        pending.append((target, destination, graph[target]["pulse"]))
                elif module == Module.conjunction:
                    # update memory for received pulse
                    graph[target]["memory"][source] = pulse
                    # if any low pulses, send high pulse
                    if any(
                        last_pulse == Pulse.LOW
                        for last_pulse in graph[target]["memory"].values()
                    ):
                        graph[target]["pulse"] = Pulse.HIGH
                    else:
                        graph[target]["pulse"] = Pulse.LOW

                    # send pulse to all destination modules
                    for destination in graph[target]["destinations"]:
                        pending.append((target, destination, graph[target]["pulse"]))
            if len(pending) > 0:
                queue.append(pending)

    counter = Counter(pulses)
    print("Part 1:", counter[Pulse.LOW] * counter[Pulse.HIGH])

    result = 1
    for module in observed_modules:
        result *= observed_modules[module][1] - observed_modules[module][0]
    print("Part 2:", result)


"""
Tree for Part 2
rx 
-> hj (send low)
-> ks (send high)
   -> **sl** (send low)
   jf (send high)
   -> **rt** (send low)
   qs (send high)
   -> **fv** (send low)
   zk (send high)
   -> **gk** (send low)
"""


if __name__ == "__main__":
    # There are 281 trillion possible combinations of 48 bits
    main(input)
