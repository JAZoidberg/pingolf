const scoringService = require("./scoring.service");

const calculateHoleScore = (req, res) => {
  try {
    const result = scoringService.calculateHoleScore(
      req.body
    );

    res.json(result);
  } catch (error) {
    console.error("Scoring error:", error);

    res.status(error.statusCode || 400).json({
      error: error.message,
    });
  }
};

module.exports = {
  calculateHoleScore,
};
