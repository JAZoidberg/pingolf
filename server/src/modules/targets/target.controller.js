const targetService = require("./target.service");

const getTargetSuggestion = async (req, res) => {
  try {
    const suggestion =
      await targetService.getTargetSuggestion(
        req.params.machineId,
        req.params.locationId
      );

    res.json(suggestion);
  } catch (error) {
    console.error("Target suggestion error:", error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        error: error.message,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        error: "Invalid ID",
      });
    }

    res.status(500).json({
      error: "Failed to generate target suggestion",
    });
  }
};

module.exports = {
  getTargetSuggestion,
};
