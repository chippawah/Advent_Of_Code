const { readFile } = require("node:fs/promises");

// The directions in which a neighbor can be found
const directions = [
  "NORTH",
  "EAST",
  "SOUTH",
  "WEST",
  "NORTH_EAST",
  "SOUTH_EAST",
  "SOUTH_WEST",
  "NORTH_WEST",
];
const diagonalDirections = directions.slice(4);
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
  // Go through all cells of the input and insert nodes in the builtGrid
  build() {
    const maxRowIndex = this.input[0].length - 1; // Number of columns in the grid
    const maxColIndex = this.input.length - 1; // Number of rows in the grid
    this.bounds = { col: maxRowIndex, row: maxColIndex };
    for (const [row, letters] of this.input.entries()) {
      // Build out an empty map of rows to fill with maps of nodes
      this.builtGrid[row] = new Array(maxRowIndex).reduce((acc, _, index) => {
        return (acc[index] = undefined);
      }, {});
      // Build out the nodes to fill the row map with
      for (const [col, letter] of letters.entries()) {
        const node = new WordSearchNode({
          coordinates: { row, col },
          value: letter,
          parent: this,
        });
        // Insert the new node at the correct coordinates in the graph
        this.builtGrid[row][col] = node;
      }
    }
  }
  getNodeAtCoordinates({ col, row }) {
    return this.builtGrid[row][col];
  }
  search(word) {
    const splitWord = word.split("");
    const instancesFound = [];
    for (const [row, nodes] of Object.entries(this.builtGrid)) {
      for (const [col, node] of Object.entries(nodes)) {
        const { matched, matchInstances } = node.search({ word: splitWord });
        if (matched)
          instancesFound.push({
            startingCoordinate: { row, col },
            matchInstances,
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
    for (const direction of directions) {
      const nextRow = this.coordinates.row + directionSteps[direction][1];
      const nextCol = this.coordinates.col + directionSteps[direction][0];
      const rowInBounds = 0 <= nextRow && nextRow <= this.parent.bounds.row;
      const colInBounds = 0 <= nextCol && nextCol <= this.parent.bounds.col;
      if (rowInBounds && colInBounds) {
        this.neighbors[direction] = {
          row: String(nextRow),
          col: String(nextCol),
        };
      }
    }
  }
  search({ word, index = 0, direction }) {
    const letter = word[index];
    if (this.value !== letter) return { matched: false }; // exit early if we dont have a match
    if (direction) {
      if (index === word.length - 1) {
        return { matched: true, coordinates: [this.coordinates] }; // return back to recursion caller because we hit the end of the word
      }
      // at this point theres a match for the letter at this node
      // continue checking neighbors in the same direction for the next letter
      const neighbor =
        this.neighbors[direction] &&
        this.parent.getNodeAtCoordinates(this.neighbors[direction]);
      if (!neighbor) return { matched: false };
      const { matched, coordinates } = neighbor.search({
        word,
        index: index + 1,
        direction,
      });

      if (matched) {
        return {
          matched,
          matchedDirections: [direction],
          coordinates: [this.coordinates].concat(coordinates),
        };
      }
      return { matched: false };
    }
    // If we don't have a direction yet its a fresh search
    // we need to store and return the directions that have match
    const matchInstances = [];
    for (const [direction, coordinates] of Object.entries(this.neighbors)) {
      const neighbor = this.parent.getNodeAtCoordinates(coordinates);
      const { matched, coordinates: matchedCoordinates } = neighbor.search({
        word,
        index: index + 1,
        direction,
      });
      if (matched) {
        matchInstances.push({
          direction,
          coordinates: [this.coordinates].concat(matchedCoordinates),
        });
      }
    }
    return { matched: matchInstances.length > 0, matchInstances };
  }
}

const solution = async (input_file) => {
  const input = await readFile(`${__dirname}/${input_file}.txt`, "utf-8");
  const rows = input.split("\n").map((r) => r.split(""));
  const wordsearch = new WordSearch({ grid: rows });
  const foundPart1 = wordsearch.search("XMAS");
  const foundPart2 = wordsearch.search("MAS");

  const getCounts = (found, checkCrossover, crossoverIndex) => {
    const { count, crossOverCount } = found.reduce(
      ({ count, midpoints, crossOverCount }, foundInstance) => {
        count += foundInstance.matchInstances.length; // increment the over all count for matches
        if (checkCrossover) {
          // go through each match and check if its a diagonal
          for (const matchInstance of foundInstance.matchInstances) {
            const diagonalMatchIndex = diagonalDirections.indexOf(
              matchInstance.direction
            );
            if (diagonalMatchIndex >= 0) {
              // check the crossover map to see if the coordinates already exist
              // if it doesn't then initialize it
              const crossoverCoodinateHash = JSON.stringify(
                matchInstance.coordinates[crossoverIndex]
              );
              if (!midpoints[crossoverCoodinateHash]) {
                midpoints[crossoverCoodinateHash] = 1;
              } else {
                // if it does then increment the crossover map for the coordinates
                midpoints[crossoverCoodinateHash]++;
              }
              if (midpoints[crossoverCoodinateHash] === 2) {
                crossOverCount++;
              }
            }
          }
        }
        return { count, midpoints, crossOverCount };
      },
      { count: 0, crossOverCount: 0, midpoints: {} }
    );
    return { count, crossOverCount };
  };
  console.log(
    `Part 1 total found count: ${getCounts(foundPart1, false).count}`
  );

  console.log(
    `Part 2 crossover count: ${getCounts(foundPart2, true, 1).crossOverCount}`
  );
  return wordsearch;
};

const SAMPLE_INPUT_FILE_NAME = "sample_input";
const ACTUAL_INPUT_FILE_NAME = "input";

(async () => {
  console.log("### EXAMPLE:");
  await solution(SAMPLE_INPUT_FILE_NAME);
  console.log("\n### ACTUAL:");
  await solution(ACTUAL_INPUT_FILE_NAME);
})();
