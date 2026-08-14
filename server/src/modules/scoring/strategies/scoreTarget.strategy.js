const calculate = ({
  targetScore,
  ballScores = [],
  ballsAllowed = 3,
  missPenaltyStrokes = 1,
}) => {
  if (
    typeof targetScore !== "number" ||
    !Number.isFinite(targetScore) ||
    targetScore <= 0
  ) {
    throw new Error("A valid targetScore is required");
  }

  if (
    !Number.isInteger(ballsAllowed) ||
    ballsAllowed < 1
  ) {
    throw new Error("ballsAllowed must be a positive integer");
  }

  if (
    !Number.isInteger(missPenaltyStrokes) ||
    missPenaltyStrokes < 0
  ) {
    throw new Error(
      "missPenaltyStrokes must be a non-negative integer"
    );
  }

  if (!Array.isArray(ballScores)) {
    throw new Error("ballScores must be an array");
  }

  if (ballScores.length > ballsAllowed) {
    throw new Error(
      "ballScores cannot contain more scores than ballsAllowed"
    );
  }

  for (let i = 0; i < ballScores.length; i += 1) {
    const score = ballScores[i];

    if (
      typeof score !== "number" ||
      !Number.isFinite(score) ||
      score < 0
    ) {
      throw new Error("Every ball score must be a valid number");
    }

    if (i > 0 && score < ballScores[i - 1]) {
      throw new Error(
        "Ball scores must be cumulative and cannot decrease"
      );
    }
  }

  const targetBallIndex = ballScores.findIndex(
    (score) => score >= targetScore
  );

  if (targetBallIndex !== -1) {
    const ballsPlayed = targetBallIndex + 1;

    return {
      status: "complete",
      reachedTarget: true,
      targetScore,
      rawScore: ballScores[targetBallIndex],
      ballsPlayed,
      strokes: ballsPlayed,
    };
  }

  if (ballScores.length < ballsAllowed) {
    return {
      status: "in_progress",
      reachedTarget: false,
      targetScore,
      rawScore:
        ballScores.length > 0
          ? ballScores[ballScores.length - 1]
          : 0,
      ballsPlayed: ballScores.length,
      strokes: null,
    };
  }

  return {
    status: "complete",
    reachedTarget: false,
    targetScore,
    rawScore: ballScores[ballScores.length - 1],
    ballsPlayed: ballsAllowed,
    strokes: ballsAllowed + missPenaltyStrokes,
  };
};

module.exports = {
  calculate,
};
