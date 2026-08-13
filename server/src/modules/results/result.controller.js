const resultService = require("./result.service");

const createResult = async (req, res) => {
  try {
    const {
      playerId,
      machineId,
      locationId,
      rawScore,
      ballsPlayed,
      strokes,
      playedAt,
    } = req.body;

    if (!playerId || !machineId || !locationId) {
      return res.status(400).json({
        error: "playerId, machineId, and locationId are required",
      });
    }

    if (rawScore === undefined || rawScore === null) {
      return res.status(400).json({
        error: "rawScore is required",
      });
    }

    const result = await resultService.createResult({
      playerId,
      machineId,
      locationId,
      rawScore,
      ballsPlayed,
      strokes,
      playedAt,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Failed to create result:", error);

    if (
      error.statusCode ||
      error.name === "CastError" ||
      error.name === "ValidationError"
    ) {
      return res.status(error.statusCode || 400).json({
        error: error.message,
      });
    }

    res.status(500).json({
      error: "Failed to create result",
    });
  }
};

const getResults = async (req, res) => {
  try {
    const results = await resultService.getResults({
      playerId: req.query.playerId,
      machineId: req.query.machineId,
      locationId: req.query.locationId,
    });

    res.json(results);
  } catch (error) {
    console.error("Failed to get results:", error);

    res.status(500).json({
      error: "Failed to get results",
    });
  }
};

const getResultById = async (req, res) => {
  try {
    const result = await resultService.getResultById(
      req.params.resultId
    );

    if (!result) {
      return res.status(404).json({
        error: "Result not found",
      });
    }

    res.json(result);
  } catch (error) {
    console.error("Failed to get result:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        error: "Invalid result ID",
      });
    }

    res.status(500).json({
      error: "Failed to get result",
    });
  }
};

module.exports = {
  createResult,
  getResults,
  getResultById,
};
