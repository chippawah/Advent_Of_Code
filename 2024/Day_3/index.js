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
  let enabled = true;
  return commands.reduce((sum, command) => {
    let newSum = sum;
    if (command === DO) enabled = true;
    else if (command === DONT) enabled = false;
    else if (enabled) {
      const [a, b] = getCommandInputArgs(command);
      newSum += parseInt(a) * parseInt(b);
    }
    return newSum;
  }, 0);
};

const main = async () => {
  const fileData = await readFile(`${__dirname}/input.txt`, "utf-8");
  const commands = getCommands(fileData, mulCommandPatternWithSwitch);
  const total = sumAllProducts(commands);
  console.log({ total });
};

main().catch(console.error);
