const { readFile } = require("node:fs/promises");

const buildRulesMap = (ruleInputs) => {
  return ruleInputs.reduce((map, rule) => {
    const [num, numToPreceed] = rule.split("|");
    // Create the rule sets if they don't already exist
    if (!map[num]) map[num] = { before: new Set(), after: new Set() };
    if (!map[numToPreceed])
      map[numToPreceed] = { before: new Set(), after: new Set() };
    // Fill in the rule set for each of the page numbers in the rule
    map[num].after.add(numToPreceed);
    map[numToPreceed].before.add(num);
    return map;
  }, {});
};

// Go through each item in the update set
// Determine which rules apply
// Ensure each rule that applies is obeyed
const isValidUpdate = (rulesMap, updateSet) => {
  let index = 0;
  const updateArray = [...updateSet];
  let allRulesObeyed = true;
  for (const [pageNumber] of updateSet.entries()) {
    const ruleSet = rulesMap[pageNumber];
    if (ruleSet) {
      const pagesToPreceedCurrent = updateSet.intersection(ruleSet.before);
      const pagesToFollowCurrent = updateSet.intersection(ruleSet.after);
      // Check to see if there are pages to ensure come before / after
      if (pagesToPreceedCurrent.size > 0) {
        // ensure each page in this set comes before the current page
        preceedingRulesObeyed = [...pagesToPreceedCurrent].every((value) => {
          return updateArray.indexOf(value) < index;
        });
        if (!preceedingRulesObeyed) {
          // break from the loop if a rule is not obeyed
          allRulesObeyed = false;
          break;
        }
      }
      if (pagesToFollowCurrent.size > 0) {
        // ensure each page in this set comes after the current page
        followingRulesObeyed = [...pagesToFollowCurrent].every((value) => {
          return updateArray.indexOf(value) > index;
        });
        // break from the loop if a rule is not obeyed
        if (!followingRulesObeyed) {
          allRulesObeyed = false;
          break;
        }
      }
    }
    index++;
  }
  // allRulesObeyed && console.log({ allRulesObeyed, updateSet });
  return allRulesObeyed;
};

const sortUpdate = (rulesMap, updateArray) => {
  const sorted = [...updateArray];
  sorted.sort((a, b) => {
    rulesForA = rulesMap[a];
    rulesForB = rulesMap[b];
    // a should come before b if rulesForA.after.has(b) or if rulesForB.before.has(a) -> -1
    // b should come before a if rulesforA.before.has(b) or if rulesForB.after.has(a) -> 1
    if (rulesForA?.after.has(b) || rulesForB?.before.has(a)) return -1;
    if (rulesForA?.before.has(b) || rulesForB?.after.has(a)) return 1;
    return 0;
  });
  return sorted;
};

const getMidPointSum = (updates) => {
  return updates.reduce((sum, updateArray) => {
    const midPointIndex = Math.floor((updateArray.length - 1) / 2);
    const midPointValue = updateArray[midPointIndex];
    return sum + parseInt(midPointValue);
  }, 0);
};

const solution = async (filename) => {
  const input = await readFile(`${__dirname}/${filename}.txt`, "utf-8");
  const rows = input.split("\n");
  // This is where the split between the page rules and the update set is
  const emptyLineIndex = rows.indexOf("");
  // For each of the numbers a set is used to store the applicaple rules
  // 'before' and 'after' refer to the page numbers that must come before/ after the key in the map
  const rulesMap = buildRulesMap(rows.slice(0, emptyLineIndex));
  const updates = rows
    .slice(emptyLineIndex + 1)
    .map((updateSet) => new Set(updateSet.split(",")));
  const { valid: validUpdates, invalid: invalidUpdates } = updates.reduce(
    ({ valid, invalid }, update) => {
      const updateArray = [...update];
      isValidUpdate(rulesMap, update)
        ? valid.push(updateArray)
        : invalid.push(updateArray);
      return { valid, invalid };
    },
    { valid: [], invalid: [] }
  );
  const sortedUpdates = invalidUpdates.map((updateArray) =>
    sortUpdate(rulesMap, updateArray)
  );
  const validMidPointSum = getMidPointSum(validUpdates);
  const invalidMidpointSum = getMidPointSum(sortedUpdates);
  return { part1: validMidPointSum, part2: invalidMidpointSum };
};

(async () => {
  const sampleSolution = await solution("sample_input");
  const actualSolution = await solution("input");
  console.log("#### SAMPLE SOLUTION");
  console.log(`PART 1: ${sampleSolution.part1}`);
  console.log(`PART 2: ${sampleSolution.part2}`);
  console.log("\n#### ACTUAL SOLUTION");
  console.log(`PART 1: ${actualSolution.part1}`);
  console.log(`PART 2: ${actualSolution.part2}`);
})();
