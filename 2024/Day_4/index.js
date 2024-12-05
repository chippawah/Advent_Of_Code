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

class WordSearch {
  constructor({ grid, autoBuild = true }) {
    this.input = grid;
    this.builtGrid = {};
    this.bounds = { col: 0, row: 0 };
    if (autoBuild) this.build();
  }
  build() {
    const maxRowIndex = this.input[0].length - 1; // Number of columns in the grid
    const maxColIndex = this.input.length - 1; // Number of rows in the grid
    this.bounds = { col: maxRowIndex, row: maxColIndex };
    for (const [row, letters] of this.input.entries()) {
      this.builtGrid[row] = new Array(maxRowIndex);
      for (const [col, letter] of letters.entries()) {
        const node = new WordSearchNode({
          coordinates: { row, col },
          value: letter,
          parent: this,
        });
        node.buildNeighbors();
        this.builtGrid[row][col] = node;
      }
    }
    return this.builtGrid;
  }
  getNodeAtCoordinates({ col, row }) {
    return this.builtGrid[row][col];
  }
  search(word) {
    const splitWord = word.split("");
    const instancesFound = [];
    for (const [row, nodes] of Object.entries(this.builtGrid)) {
      for (const [col, node] of nodes.entries()) {
        // console.log({ node });
        const { matched, matchedDirections } = node.search({ word: splitWord });
        if (matched)
          instancesFound.push({
            startingCoordinate: { row, col },
            matchedDirections,
          });
      }
    }
    return instancesFound;
  }
}
class WordSearchNode {
  constructor({ coordinates, value, parent }) {
    this.parent = parent;
    this.coordinates = coordinates;
    this.value = value; // The letter that the node contains
    this.neighbors = {};
  }
  addNeighbor({ direction, value, coordinates }) {
    if (!this.neighbors[direction]) {
      this.neighbors[direction] = new WordSearchNode({
        coordinates,
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
        0 <= nextCoordinate.row && nextCoordinate.row <= this.parent.bounds.row;
      const colInBounds =
        0 <= nextCoordinate.col && nextCoordinate.col <= this.parent.bounds.col;
      if (rowInBounds && colInBounds) {
        if (
          !this.parent.builtGrid[nextCoordinate.row] ||
          !this.parent.builtGrid[nextCoordinate.row][nextCoordinate.col]
        ) {
          const neighborValue =
            this.parent.input[nextCoordinate.row][nextCoordinate.col];
          this.addNeighbor({
            direction,
            value: neighborValue,
            coordinates: nextCoordinate,
          });
        } else {
          this.neighbors[direction] =
            this.parent.builtGrid[nextCoordinate.row][nextCoordinate.col];
        }
      }
    }
  }
  search({ word, index = 0, direction }) {
    const letter = word[index];
    console.log(
      `Matching node value '${this.value}' against '${letter}' at row ${
        this.coordinates.row
      } and col ${this.coordinates.col}: ${this.value === word[index]} `
    );
    if (this.value !== letter) return { matched: false }; // exit early if we dont have a match
    if (direction) {
      if (index === word.length - 1) {
        console.log("Hit the end of the word");
        return { matched: true, matchedDirections: [direction] }; // return back to recursion caller because we hit the end of the word
      }
      // at this point theres a match for the letter
      // continue checking neighbors in the same direction for the next letter
      const neighbor = this.neighbors[direction];
      if (!neighbor) {
        console.log("No neighbor to search");
        return { matched: false };
      }
      console.log(`Searching next neighbor to the ${direction}`);
      const { matched } = neighbor.search({
        word,
        index: index + 1,
        direction,
      });
      return { matched, matchedDirections: [direction] };
    }
    console.log("Starting fresh search");
    // If we don't have a direction yet its a fresh search
    // we need to store and return the directions that have match
    const matchedDirections = [];
    for (const [direction, neighbor] of Object.entries(this.neighbors)) {
      if (neighbor.search({ word, index: index + 1, direction }).matched) {
        console.log(
          `Found match for ${word.join("")} starting at row ${
            this.coordinates.row
          } and col ${this.coordinates.col} in direction ${direction}`
        );
        matchedDirections.push(direction);
      }
    }
    return { matched: matchedDirections.length > 0, matchedDirections };
  }
}

const solution = async (input_file) => {
  const input = await readFile(`${__dirname}/${input_file}.txt`, "utf-8");
  const rows = input.split("\n");
  // const formattedRows = rows.map((r) => r.split(""));
  const sampleFormattedRows = [
    ["A", "S", "A"],
    ["S", "B", "S"],
    ["B", "A", "B"],
  ];
  const sampleFormattedRows2 = [
    ["X", "M", "A", "S"],
    ["M", "M", "S", "A"],
    ["A", "X", "X", "M"],
    ["S", "M", "A", "X"],
  ];
  // Start building an WordSearch to search through
  const wordsearch = new WordSearch({ grid: sampleFormattedRows2 });
  return wordsearch;
};

const SAMPLE_INPUT_FILE_NAME = "sample_input";
const ACTUAL_INPUT_FILE_NAME = "input";

(async () => {
  const sampleSolution = await solution(SAMPLE_INPUT_FILE_NAME);
  console.log(sampleSolution.search("XMAS"));
})();
