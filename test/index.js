const assert = require('assert');
const part1 = require('../part1');
const part2 = require('../part2');

describe('Function who finds all combination numbers, which the sum equal to 10', () => {
  it('"findNumbers" should be return the array [[4, 6], [1, 9], [10]]', () => {
    assert.deepStrictEqual(part1.findNumbers([4, 6, 7, 1, 9, 10], 10), [
      [4, 6],
      [1, 9],
      [10]
    ]);
  });
});

describe('Function controlling frequency execute other functions', () => {
  it('"throttle" should be return the "123", "undefined", "123"', (done) => {
    const throttledFunc = part2.throttle(() => 123, 100);
    assert.strictEqual(throttledFunc(), 123);
    assert.strictEqual(throttledFunc(), undefined);
    setTimeout(() => {
      assert.strictEqual(throttledFunc(), 123);
      done();
    }, 101);
  });
});
