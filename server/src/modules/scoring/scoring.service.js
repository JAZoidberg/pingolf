const scoreTargetStrategy = require(
  "./strategies/scoreTarget.strategy"
);

const strategies = {
  scoreTarget: scoreTargetStrategy,
};

const calculateHoleScore = (scoringData) => {
  const { scoringType } = scoringData;

  const strategy = strategies[scoringType];

  if (!strategy) {
    const error = new Error(
      `Unsupported scoring type: ${scoringType}`
    );

    error.statusCode = 400;

    throw error;
  }

  return strategy.calculate(scoringData);
};

module.exports = {
  calculateHoleScore,
};
