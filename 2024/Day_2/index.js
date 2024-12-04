const { readFile } = require("node:fs/promises");

const isRowSafe = (formattedRow) => {
  const windows = formattedRow.reduce((acc, _, index, row) => {
    if (index + 1 >= formattedRow.length) {
      return acc;
    }
    const newWindow = row.slice(index, index + 2);
    return acc.concat([newWindow]);
  }, []);
  const intervals = windows.map(([first, second]) => {
    const interval = first - second;
    return interval;
  });
  const allIncreasing = intervals.every((interval) => {
    return 1 <= interval && interval <= 3;
  });
  const allDecreasing = intervals.every((interval) => {
    return -3 <= interval && interval <= -1;
  });
  const isSafe = allIncreasing || allDecreasing;
  console.log({
    isSafe,
    formattedRow,
    intervals,
    state: allDecreasing ? "decreasing" : "increasing",
  });
  return isSafe;
};

const main = async () => {
  try {
    // The usual grabbing of the file, reading, and splitting into rows
    const fileData = await readFile(`${__dirname}/input.txt`, "utf8");
    const rows = fileData.split("\n");
    let unmodifiedSafeCount = 0;
    let safeCount = 0;
    // Go through each of the rows and determine if the row is safe and increment the safeCount
    for (const row of rows) {
      const formattedRow = row.split(" ").map((rowItem) => parseInt(rowItem));
      const isSafe = isRowSafe(formattedRow);
      if (isSafe) {
        safeCount++;
        unmodifiedSafeCount++;
      } else {
        let isSafeAfterItemRemoval = false;
        for (const [index, value] of formattedRow.entries()) {
          const listForRetest = [...formattedRow];
          listForRetest.splice(index, 1);
          isSafeAfterItemRemoval = isRowSafe(listForRetest);
          if (isSafeAfterItemRemoval) {
            safeCount++;
            break;
          }
        }
      }
    }
    console.log({ safeCount, unmodifiedSafeCount });
  } catch (e) {
    console.error(e);
  }
};

main().catch(console.error);
