const { readFile } = require("node:fs/promises");

const testInput =
  "xmul(2,4)%&mul[3,7]!@^do_not_mul(5,5)+mul(32,64]then(mul(11,8)mul(8,5))";
// expectedOutput: 161
const testInput2 =
  "xmul(2,4)&mul[3,7]!^don't()_mul(5,5)+mul(32,64](mul(11,8)undo()?mul(8,5))";
// expectedOutput: 48

const inputArgRegex = /\d{1,3}/g;
const mulCommandPatternWithSwitch =
  /((do\(\)|don't\(\))|(mul\((\d{1,3}),(\d{1,3})\)))/gm;
const DO = "do()";
const DONT = "don't()";

const getCommands = (inputStr, matchExpression) => {
  return inputStr.match(matchExpression);
};
const getCommandInputArgs = (command) => {
  return command.match(inputArgRegex);
};

const sumAllProducts = (commands) => {
  console.log({ commands });
  let enabled = true;
  return commands.reduce((sum, command) => {
    console.log({ enabled, sum, command });
    let newSum = sum;
    if (command === DO) {
      console.log("Enabling");
      enabled = true;
    } else if (command === DONT) {
      console.log("Disabling");
      enabled = false;
    } else if (enabled) {
      console.log("Enabdled and summing products");
      const [a, b] = getCommandInputArgs(command);
      newSum += parseInt(a) * parseInt(b);
      console.log({ newSum });
    }
    return newSum;
  }, 0);
};

const main = async () => {
  const fileData = await readFile(`${__dirname}/input.txt`, "utf-8");
  let total = 0;
  const commands = getCommands(fileData, mulCommandPatternWithSwitch);
  const sumOfProducts = sumAllProducts(commands);
  console.log({ sumOfProducts });
  total += sumOfProducts;
  console.log({ total });
  console.log({ finalSum: total });
};

main().catch(console.error);
