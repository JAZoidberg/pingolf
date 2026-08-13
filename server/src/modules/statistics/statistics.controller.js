const statisticsService = require("./statistics.service");

const handleError = (res, error) => {
  console.error("Statistics error:", error);

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

  return res.status(500).json({
    error: "Failed to calculate statistics",
  });
};

const getPlayerMachineStatistics = async (req, res) => {
  try {
    const statistics =
      await statisticsService.getPlayerMachineStatistics(
        req.params.playerId,
        req.params.machineId
      );

    res.json(statistics);
  } catch (error) {
    handleError(res, error);
  }
};

const getMachineStatistics = async (req, res) => {
  try {
    const statistics =
      await statisticsService.getMachineStatistics(
        req.params.machineId
      );

    res.json(statistics);
  } catch (error) {
    handleError(res, error);
  }
};

const getMachineLocationStatistics = async (req, res) => {
  try {
    const statistics =
      await statisticsService.getMachineLocationStatistics(
        req.params.machineId,
        req.params.locationId
      );

    res.json(statistics);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getPlayerMachineStatistics,
  getMachineStatistics,
  getMachineLocationStatistics,
};
