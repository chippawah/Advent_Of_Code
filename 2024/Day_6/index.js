const { readFile } = require("node:fs/promises");

// directionSteps correspond with the x and y moves where 0,0 is *
// NW N NE
// W  * E
// SW S SE
const directionSteps = new Map(
  Object.entries({
    NORTH: { col: 0, row: -1, next: "EAST" },
    EAST: { col: 1, row: 0, next: "SOUTH" },
    SOUTH: { col: 0, row: 1, next: "WEST" },
    WEST: { col: -1, row: 0, next: "NORTH" },
  })
);

class LabMap {
  constructor({ input }) {
    this.input = input;
    this.guardAt = { row: null, col: null };
    this.inputMap = new Map(
      input
        .split("\n")
        .map((row, rowIndex) => {
          return new Map(
            row
              .split("")
              .map((col, colIndex) => {
                const node = new LabMapNode({
                  parent: this,
                  value: col,
                  coordinates: {
                    row: rowIndex,
                    col: colIndex,
                  },
                });
                if (col === "^") {
                  this.guardAt = node.coordinates;
                }
                return node;
              })
              .entries()
          );
        })
        .entries()
    );
    this.bounds = {
      row: this.inputMap.size - 1,
      col: this.inputMap.get(0).size - 1,
    };
  }
  areCoodinatesInRange({ row, col }) {
    const rowInbound = 0 <= row && row <= this.bounds.row;
    const colInbound = 0 <= col && col <= this.bounds.col;
    return rowInbound && colInbound;
  }
  getNodeAtCoordinates({ col, row }) {
    const inRange = this.areCoodinatesInRange({ row, col });
    return inRange ? this.inputMap.get(row).get(col) : null;
  }
}

class LabMapNode {
  constructor({ value, parent, coordinates }) {
    this.parent = parent;
    this.value = value;
    this.coordinates = coordinates;
  }
  getNeighbor(direction) {
    return this.parent.getNodeAtCoordinates({
      row: this.coordinates.row + directionSteps.get(direction).row,
      col: this.coordinates.col + directionSteps.get(direction).col,
    });
  }
  traverse({ direction, visited = new Set(), obstacles = new Map() }) {
    visited.add(this.coordinates);
    const neighbor = this.getNeighbor(direction);
    // const jsonObstable = JSON.stringify({
    //   ...neighbor?.coordinates,
    //   direction,
    // });
    if (neighbor === null) return { visited, obstacles };
    if (neighbor.value === "#") {
      // const obstacleAlreadyVisited = obstacles.get(jsonObstable);
      // If we find this coordinate set and direction in the obsacles map then we can exit knowing we found a loop
      // if (obstacleAlreadyVisited) return { visited, obstacles };
      // obstacles.set(jsonObstable, true);
      return this.traverse({
        direction: directionSteps.get(direction).next,
        visited,
        obstacles,
      });
    }
    return neighbor.traverse({ direction, visited, obstacles });
  }
}

const solution = async (filename) => {
  const input = await readFile(`${__dirname}/${filename}.txt`, "utf-8");
  const labMap = new LabMap({ input });
  // start at the labMap.guardAt
  // traverse north until node.getNeighbor(north) returns node with # or null
  // once either of those conditions are true go to the next direction and do it again
  const startingNode = labMap.getNodeAtCoordinates(labMap.guardAt);
  const { visited, obstacles } = startingNode.traverse({ direction: "NORTH" });
  console.log("Visited Count:", visited.size);
};

(async () => {
  await solution("sample_input");
  await solution("input");
})();
