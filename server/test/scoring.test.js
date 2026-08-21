const test = require("node:test");
const assert = require("node:assert/strict");

const scoreTargetStrategy = require(
  "../src/modules/scoring/strategies/scoreTarget.strategy"
);

test("reaching target on ball 1 scores 1 stroke", () => {
  const result = scoreTargetStrategy.calculate({
    targetScore: 80000000,
    ballScores: [85000000],
    ballsAllowed: 3,
    missPenaltyStrokes: 1,
  });

  assert.equal(result.status, "complete");
  assert.equal(result.reachedTarget, true);
  assert.equal(result.rawScore, 85000000);
  assert.equal(result.ballsPlayed, 1);
  assert.equal(result.strokes, 1);
});

test("reaching target on ball 3 scores 3 strokes", () => {
  const result = scoreTargetStrategy.calculate({
    targetScore: 80000000,
    ballScores: [
      25000000,
      52000000,
      81000000,
    ],
    ballsAllowed: 3,
    missPenaltyStrokes: 1,
  });

  assert.equal(result.status, "complete");
  assert.equal(result.reachedTarget, true);
  assert.equal(result.rawScore, 81000000);
  assert.equal(result.ballsPlayed, 3);
  assert.equal(result.strokes, 3);
});

test("unfinished hole remains in progress", () => {
  const result = scoreTargetStrategy.calculate({
    targetScore: 80000000,
    ballScores: [
      25000000,
      52000000,
    ],
    ballsAllowed: 3,
    missPenaltyStrokes: 1,
  });

  assert.equal(result.status, "in_progress");
  assert.equal(result.reachedTarget, false);
  assert.equal(result.rawScore, 52000000);
  assert.equal(result.ballsPlayed, 2);
  assert.equal(result.strokes, null);
});

test("missing target after all balls adds penalty stroke", () => {
  const result = scoreTargetStrategy.calculate({
    targetScore: 80000000,
    ballScores: [
      10000000,
      25000000,
      50000000,
    ],
    ballsAllowed: 3,
    missPenaltyStrokes: 1,
  });

  assert.equal(result.status, "complete");
  assert.equal(result.reachedTarget, false);
  assert.equal(result.rawScore, 50000000);
  assert.equal(result.ballsPlayed, 3);
  assert.equal(result.strokes, 4);
});

test("custom miss penalty is applied", () => {
  const result = scoreTargetStrategy.calculate({
    targetScore: 80000000,
    ballScores: [
      10000000,
      25000000,
      50000000,
    ],
    ballsAllowed: 3,
    missPenaltyStrokes: 2,
  });

  assert.equal(result.strokes, 5);
});

test("ball scores cannot decrease", () => {
  assert.throws(
    () => {
      scoreTargetStrategy.calculate({
        targetScore: 80000000,
        ballScores: [
          50000000,
          40000000,
        ],
        ballsAllowed: 3,
        missPenaltyStrokes: 1,
      });
    },
    /Ball scores must be cumulative/
  );
});

test("cannot submit more scores than balls allowed", () => {
  assert.throws(
    () => {
      scoreTargetStrategy.calculate({
        targetScore: 80000000,
        ballScores: [
          10000000,
          20000000,
          30000000,
          40000000,
        ],
        ballsAllowed: 3,
        missPenaltyStrokes: 1,
      });
    },
    /more scores than ballsAllowed/
  );
});

test("target score must be positive", () => {
  assert.throws(
    () => {
      scoreTargetStrategy.calculate({
        targetScore: 0,
        ballScores: [],
        ballsAllowed: 3,
        missPenaltyStrokes: 1,
      });
    },
    /valid targetScore/
  );
});

test("uses first ball that reaches target", () => {
  const result = scoreTargetStrategy.calculate({
    targetScore: 80000000,
    ballScores: [
      30000000,
      85000000,
      120000000,
    ],
    ballsAllowed: 3,
    missPenaltyStrokes: 1,
  });

  assert.equal(result.reachedTarget, true);
  assert.equal(result.rawScore, 85000000);
  assert.equal(result.ballsPlayed, 2);
  assert.equal(result.strokes, 2);
});
