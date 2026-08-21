const test = require("node:test");
const assert = require("node:assert/strict");

const {
  calculateScoreSummary,
} = require(
  "../src/modules/statistics/statistics.service"
);

test("calculates statistics for odd sample size", () => {
  const result = calculateScoreSummary([
    74250300,
    48100000,
    103500000,
  ]);

  assert.deepEqual(result, {
    sampleSize: 3,
    averageScore: 75283433,
    medianScore: 74250300,
    minScore: 48100000,
    maxScore: 103500000,
  });
});

test("calculates median for even sample size", () => {
  const result = calculateScoreSummary([
    10,
    20,
    30,
    40,
  ]);

  assert.equal(result.sampleSize, 4);
  assert.equal(result.averageScore, 25);
  assert.equal(result.medianScore, 25);
  assert.equal(result.minScore, 10);
  assert.equal(result.maxScore, 40);
});

test("empty score list returns null statistics", () => {
  const result = calculateScoreSummary([]);

  assert.deepEqual(result, {
    sampleSize: 0,
    averageScore: null,
    medianScore: null,
    minScore: null,
    maxScore: null,
  });
});

test("statistics calculation does not change original array", () => {
  const scores = [
    30,
    10,
    20,
  ];

  calculateScoreSummary(scores);

  assert.deepEqual(scores, [
    30,
    10,
    20,
  ]);
});
