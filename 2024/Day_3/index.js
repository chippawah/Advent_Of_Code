const { readFile } = require("node:fs/promises");

const testInput =
  "xmul(2,4)%&mul[3,7]!@^do_not_mul(5,5)+mul(32,64]then(mul(11,8)mul(8,5))";
const expectedOutput = 161;
const testInput2 =
  "xmul(2,4)&mul[3,7]!^don't()_mul(5,5)+mul(32,64](mul(11,8)undo()?mul(8,5))";
const expectedOutput2 = 48;

const mulCommandRegex =
  /(?<commands>mul\((?<arg1>\d{1,3}),(?<arg2>\d{1,3})\))/g;
const inputArgRegex = /\d{1,3}/g;
const mulCommandPatternWithSwitch =
  /(?<switch>do\(\)|don't\(\))|(?<commands>mul\((?<arg1>\d{1,3}),(?<arg2>\d{1,3})\))/g;

const getCommands = (inputStr, matchExpression) => {
  return inputStr.match(matchExpression);
};
const getCommandInputArgs = (command) => {
  return command.match(inputArgRegex);
};

const sumAllProducts = (commands) => {
  return commands.reduce((sum, command) => {
    const [a, b] = getCommandInputArgs(command);
    return sum + parseInt(a) * parseInt(b);
  }, 0);
};

const main = async () => {
  const fileData = await readFile(`${__dirname}/input.txt`, "utf-8");
  const rows = fileData.split("\n");
  // const rows = [testInput];
  let total = 0;
  for (const row of rows) {
    const mulCommands = getCommands(row, mulCommandRegex);
    const sumOfProducts = sumAllProducts(mulCommands);
    total += sumOfProducts;
    console.log({ mulCommands, sumOfProducts, total });
  }
  console.log({ finalSum: total });
};

main().catch(console.error);
