'use strict';

const that = module.exports = {
  findNumbers(numbers, target) {
    const results = [];
    for (let i = 0; i < numbers.length; i++) {
      const item = numbers[i];
      if (item >= target) {
        if (item === target) {
          results.push([item]);
        }
        continue;
      }
      const tmpResults = that.findNumbers(numbers.slice(i + 1), target - item);
      if (!tmpResults.length) {
        continue;
      }
      for (const res of tmpResults) {
        results.push([item].concat(res));
      }
    }
    return results;
  }
};
