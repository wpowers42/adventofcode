import os
from itertools import chain

dir = os.path.dirname(os.path.realpath(__file__))

input = """seeds: 79 14 55 13

seed-to-soil map:
50 98 2
52 50 48

soil-to-fertilizer map:
0 15 37
37 52 2
39 0 15

fertilizer-to-water map:
49 53 8
0 11 42
42 0 7
57 7 4

water-to-light map:
88 18 7
18 25 70

light-to-temperature map:
45 77 23
81 45 19
68 64 13

temperature-to-humidity map:
0 69 1
1 0 69

humidity-to-location map:
60 56 37
56 93 4"""

with open(os.path.join(dir, "./input.txt"), "r") as f:
    input = f.read()

almanac = [section.split("\n") for section in input.split("\n\n")]
seeds, maps = almanac[0], almanac[1:]
seeds = [int(seed) for seed in seeds[0].split(": ")[1].split(" ")]


def part_1(maps, seeds):
    locations = []
    for seed in seeds:
        for map in maps:
            for row in map[1:]:
                destination, source, length = [int(n) for n in row.split(" ")]
                if seed >= source and seed <= source + length:
                    seed = destination + (seed - source)
                    break
        locations.append(seed)
        if len(locations) % 100000 == 0:
            print(len(locations))
    return min(locations)


def test_overlap(range_a, range_b):
    # No Overlap
    if range_a[1] < range_b[0] or range_a[0] > range_b[1]:
        return ([range_a], None)

    # Finding the Overlapping Range
    overlap_start = max(range_a[0], range_b[0])
    overlap_end = min(range_a[1], range_b[1])
    overlap_range = (overlap_start, overlap_end)

    # Finding Non-Overlapping Ranges
    non_overlapping_ranges = []
    if range_a[0] < overlap_start:
        non_overlapping_ranges.append((range_a[0], overlap_start - 1))
    if range_a[1] > overlap_end:
        non_overlapping_ranges.append((overlap_end + 1, range_a[1]))

    # overlap_range = overlap_range if overlap_range[0] != overlap_range[1] else None
    return (non_overlapping_ranges, overlap_range)


def part_2(maps, seeds):
    pairs = [(seeds[i], seeds[i] + seeds[i + 1]) for i in range(0, len(seeds), 2)]
    pairs.sort()

    parsed_maps = []
    for map in maps:
        parsed_map = []
        for coords in map[1:]:
            destination, source, length = [int(n) for n in coords.split(" ")]
            parsed_map.append((source, source + length - 1, destination - source))
        parsed_map.sort(reverse=False)
        parsed_maps.append(parsed_map)

    for map in parsed_maps:
        new_pairs = set()
        for pair in pairs:
            for coords in map:
                if pair is None:
                    break
                # print("pair coords:", pair, coords)
                non_overlapping_ranges, overlap_range = test_overlap(
                    pair, (coords[0], coords[1])
                )
                pair = None
                # need to check of non overlap is below or above the coords
                for non_overlap_range in non_overlapping_ranges:
                    if non_overlap_range[0] < coords[0]:
                        # we no longer need to consider this pair for this map
                        new_pairs.add(non_overlap_range)
                    elif non_overlap_range[1] > coords[1]:
                        # this pair is still valid for this map
                        pair = non_overlap_range

                if overlap_range is not None:
                    new_pairs.add(
                        (overlap_range[0] + coords[2], overlap_range[1] + coords[2])
                    )
            if pair is not None:
                new_pairs.add(pair)
        pairs = sorted(list(new_pairs))

    return min(pairs)[0]


print("Part 1: ", part_1(maps, seeds))
print("Part 2: ", part_2(maps, seeds))
