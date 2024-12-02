const { readFile } = require('node:fs/promises');

const main = async () => {
  try {
    // Read the file
    const data = await readFile(`${__dirname}/input.txt`, 'utf8');
    // create two lists to use for comparing columns
    // also create the counts map for the right side
    const rightCounts = {};
    const leftList = [];
    const rightList = [];
    // split the data read into rows
    const rows = data.split('\n');
    // clean up the string and push the numeric values of the IDs onto each list
    // create counts of each of the values in the right list
    for (const row of rows) {
      const [leftString, rightString] = row.split(' ').filter((val) => val !== '');
      leftList.push(parseInt(leftString));
      rightList.push(parseInt(rightString));
      rightCounts[rightString] = (rightCounts[rightString] || 0) + 1;
    }
    // Sort 'em
    leftList.sort((a, b) => a - b);
    rightList.sort((a, b) => a - b);
    // Get the absolute value between the two numbers
    // Also build the similarity score for the left list
    let totalDifference = 0;
    let similarityScore = 0;
    for (let i = 0 ; i < rows.length ; i++) {
      const leftVal = leftList[i];
      const rightVal = rightList[i];
      const rightCount = rightCounts[leftVal.toString()] ?? 0;
      similarityScore += rightCount * leftVal;
      totalDifference += Math.abs(leftVal - rightVal);
    }
    console.log({ totalDifference, similarityScore });
  } catch (e) {
    console.error(e);
  }
}

main().catch((e) => { console.error(e) })