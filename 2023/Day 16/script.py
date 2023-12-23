from enum import Enum

with open("input.txt") as f:
    input = f.read()

with open("example.txt") as f:
    example = f.read()


class Direction(Enum):
    NORTH = (-1, 0)
    EAST = (0, 1)
    SOUTH = (1, 0)
    WEST = (0, -1)


class Tile(Enum):
    EMPTY = "."
    FORWARD_MIRROR = "/"
    BACKWARD_MIRROR = "\\"
    VERTICAL_SPLITTER = "|"
    HORIZONTAL_SPLITTER = "-"


class Grid:
    def __init__(self, grid, initial_beam):
        """
        :type grid: str
        :type initial_beam: Beam
        """
        self.grid = [[Tile(c) for c in row] for row in grid.split("\n")]
        self.width = len(self.grid)
        self.height = len(self.grid[0])
        self.beams = [initial_beam]
        self.unique_beam_directions = set()

    def get_tile(self, x, y):
        """
        :type x: int
        :type y: int
        """
        if x < 0 or x >= self.width or y < 0 or y >= self.height:
            return None
        return self.grid[y][x]

    def add_beam(self, x, y, direction):
        """
        :type x: int
        :type y: int
        :type direction: Direction
        """
        if self.has_unique_beam_direction(x, y, direction):
            return
        self.beams.append(Beam(x, y, direction))
        self.add_unique_beam_direction(x, y, direction)

    def add_unique_beam_direction(self, x, y, direction):
        """
        :type x: int
        :type y: int
        :type direction: Direction
        """
        self.unique_beam_directions.add((x, y, direction))

    def has_unique_beam_direction(self, x, y, direction):
        """
        :type x: int
        :type y: int
        :type direction: Direction
        """
        return (x, y, direction) in self.unique_beam_directions

    def solve(self):
        for step in range(self.width * self.height):
            if not self.update():
                return self.count_energized_tiles()
        print("No solution found")

    def update(self):
        for beam in list(filter(lambda beam: beam.moving, self.beams)):
            new_beam = beam.update(self)
            if new_beam is not None:
                self.add_beam(*new_beam)
        if len(list(filter(lambda beam: beam.moving, self.beams))) == 0:
            # print("No more beams moving")
            return False
        return True

    def print(self):
        # create a copy of the grid, replace cells with beams with X
        # use the value of the enum to get the character
        grid = [
            [self.grid[y][x].value for x in range(self.width)]
            for y in range(self.height)
        ]
        for beam in filter(lambda beam: beam.moving, self.beams):
            grid[beam.y][beam.x] = "X"
        for row in grid:
            print("".join(map(str, row)))

    def count_energized_tiles(self):
        # create a set of all tiles that have been visited by a beam
        tiles = set()
        for beam in self.beams:
            tiles.update(beam.visited_tiles)
        return len(tiles)

    def print_energized_tiles(self):
        # create a set of all tiles that have been visited by a beam
        tiles = set()
        for beam in self.beams:
            tiles.update(beam.visited_tiles)
        # create a copy of the grid, replace cells with beams with X
        # use the value of the enum to get the character
        grid = [
            [self.grid[y][x].value for x in range(self.width)]
            for y in range(self.height)
        ]
        for tile in tiles:
            grid[tile[1]][tile[0]] = "X"
        for row in grid:
            print("".join(map(str, row)))


class Beam:
    def __init__(self, x, y, direction):
        """
        :type x: int
        :type y: int
        :type direction: Direction
        """
        self.x = x
        self.y = y
        self.direction = direction
        self.moving = True
        self.visited_tiles = set()

    def add_visited_tile(self, x, y):
        self.visited_tiles.add((x, y))

    def update(self, grid):
        """
        :type grid: Grid
        """
        if not self.moving:
            return

        self.x += self.direction.value[1]
        self.y += self.direction.value[0]

        tile = grid.get_tile(self.x, self.y)

        if tile is None:
            self.moving = False
            return None
        # stop if any beam has visited this tile in this direction
        if grid.has_unique_beam_direction(self.x, self.y, self.direction):
            self.moving = False
            return None

        grid.add_unique_beam_direction(self.x, self.y, self.direction)
        self.add_visited_tile(self.x, self.y)
        # print(self.x, self.y, tile)
        if tile == Tile.EMPTY:
            # nothing happens
            pass
        elif tile == Tile.FORWARD_MIRROR:
            # turn right by 90 degrees e.g. (-1, 0) -> (0, 1)
            self.direction = Direction(
                (-self.direction.value[1], -self.direction.value[0])
            )
        elif tile == Tile.BACKWARD_MIRROR:
            # turn left by 90 degrees e.g. (1, 0) -> (0, 1)
            self.direction = Direction(
                (self.direction.value[1], self.direction.value[0])
            )
        elif tile == Tile.VERTICAL_SPLITTER:
            # results in two beams going north and south
            if self.direction in [Direction.WEST, Direction.EAST]:
                self.direction = Direction.SOUTH
                return self.x, self.y, Direction.NORTH
        elif tile == Tile.HORIZONTAL_SPLITTER:
            # results in two beams going east and west
            if self.direction in [Direction.NORTH, Direction.SOUTH]:
                self.direction = Direction.WEST
                return self.x, self.y, Direction.EAST

        return None


def main():
    # input = example  # 46 and 51

    # Part 1
    grid = Grid(input, Beam(-1, 0, Direction.EAST))
    print("Part 1:", grid.solve())

    # Part 2
    results = []

    rows, cols = grid.height, grid.width
    for row in range(rows + 1):
        results.append(Grid(input, Beam(-1, row, Direction.EAST)).solve())
        results.append(Grid(input, Beam(cols, row, Direction.WEST)).solve())

    for col in range(cols + 1):
        results.append(Grid(input, Beam(col, -1, Direction.SOUTH)).solve())
        results.append(Grid(input, Beam(col, rows, Direction.NORTH)).solve())

    print("Part 2:", max(results))


if __name__ == "__main__":
    main()
