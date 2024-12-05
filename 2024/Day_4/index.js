const { readFile } = require("node:fs/promises");

// The directions in which a neighbor can be found
const directions = [
  "NORTH",
  "NORTH_EAST",
  "EAST",
  "SOUTH_EAST",
  "SOUTH",
  "SOUTH_WEST",
  "WEST",
  "NORTH_WEST",
];
// directionSteps correspond with the x and y moves where 0,0 is *
// NW N NE
// W  * E
// SW S SE
const directionSteps = {
  NORTH: [0, -1],
  NORTH_EAST: [1, -1],
  EAST: [1, 0],
  SOUTH_EAST: [1, 1],
  SOUTH: [0, 1],
  SOUTH_WEST: [-1, 1],
  WEST: [-1, 0],
  NORTH_WEST: [-1, -1],
};

class Octree {
  constructor({ grid, autoBuild }) {
    this.input = grid;
    this.builtGrid = [];
    this.bounds = { x: 0, y: 0 };
    if (autoBuild) this.build();
  }
  build() {
    const xBounds = this.input[0].length - 1; // Number of columns in the grid
    const yBounds = this.input.length - 1; // Number of rows in the grid
    this.bounds = { x: xBounds, y: yBounds };
    for (const [row, letters] of this.input.entries()) {
      if (!this.builtGrid[row]) this.builtGrid.push(new Array(xBounds));
      if (row + 1 < yBounds) this.builtGrid.push(new Array(xBounds));
      for (const [col, letter] of letters.entries()) {
        const node = new OctreeNode({
          coordinates: { row, col },
          value: letter,
          parent: this,
        });
        node.buildNeighbors();
        console.log({ node });
        this.builtGrid[row][col] = node;
      }
    }
    return this.builtGrid;
  }
  getNodeAtCoordinates({ x, y }) {
    return this.builtGrid[y][x];
  }
}
class OctreeNode {
  constructor({ coordinates, value, parent }) {
    this.parent = parent;
    this.coordinates = coordinates;
    this.value = value; // The letter that the node contains
    this.neighbors = {};
  }
  addNeigbor(direction, value, neighborCoordinates) {
    if (!this.neighbors[direction]) {
      this.neighbors[direction] = new OctreeNode({
        coordinates: neighborCoordinates,
        value,
        parent: this.parent,
      });
    }
  }
  buildNeighbors() {
    for (const direction of directions) {
      const nextCoordinate = {
        col: this.coordinates.col + directionSteps[direction][0],
        row: this.coordinates.row + directionSteps[direction][1],
      };
      const rowInBounds =
        0 <= nextCoordinate.row && nextCoordinate.row <= this.parent.bounds.y;
      const colInBounds =
        0 <= nextCoordinate.col && nextCoordinate.col <= this.parent.bounds.x;
      if (rowInBounds && colInBounds) {
        if (
          !this.parent.builtGrid[nextCoordinate.row] ||
          !this.parent.builtGrid[nextCoordinate.row][nextCoordinate.col]
        ) {
          const neighborValue =
            this.parent.input[nextCoordinate.row][nextCoordinate.col];
          this.addNeigbor(direction, neighborValue, nextCoordinate);
        } else {
          this.neighbors[direction] =
            this.parent.builtGrid[nextCoordinate.row][nextCoordinate.col];
        }
      }
    }
  }
}

const solution = async (input_file) => {
  const input = await readFile(`${__dirname}/${input_file}.txt`, "utf-8");
  const rows = input.split("\n");
  // const formattedRows = rows.map((r) => r.split(""));
  const formattedRows = [
    ["x", "M", "A", "S"],
    ["M", "M", "S", "A"],
    ["A", "X", "X", "M"],
    ["S", "M", "A", "X"],
  ];
  // Start building an Octree to search through
  const octree = new Octree({ grid: formattedRows, autoBuild: true });
  return octree;
};

const SAMPLE_INPUT_FILE_NAME = "sample_input";
const ACTUAL_INPUT_FILE_NAME = "input";

(async () => {
  const sampleSolution = await solution(SAMPLE_INPUT_FILE_NAME);
  console.log(sampleSolution.getNodeAtCoordinates({ x: 2, y: 2 }));
})();
