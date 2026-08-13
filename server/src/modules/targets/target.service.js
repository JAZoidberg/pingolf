const statisticsService = require("../statistics/statistics.service");

const MIN_SAMPLE_SIZE = 3;

const getTargetSuggestion = async (machineId, locationId) => {
  const [locationStats, globalStats] = await Promise.all([
    statisticsService.getMachineLocationStatistics(
      machineId,
      locationId
    ),
    statisticsService.getMachineStatistics(machineId),
  ]);

  const local = locationStats.statistics;
  const global = globalStats.statistics;

  let suggestedTarget = null;
  let source = null;
  let reason = null;

  if (
    local.sampleSize >= MIN_SAMPLE_SIZE &&
    local.medianScore !== null
  ) {
    suggestedTarget = local.medianScore;
    source = "location";
    reason = "Location median has enough recorded results";
  } else if (
    global.sampleSize >= MIN_SAMPLE_SIZE &&
    global.medianScore !== null
  ) {
    suggestedTarget = global.medianScore;
    source = "global";
    reason = "Not enough location data; using global median";
  } else {
    reason = "Not enough recorded results to suggest a target";
  }

  return {
    machine: locationStats.machine,
    location: locationStats.location,

    recommendation: {
      suggestedTarget,
      source,
      minimumSampleSize: MIN_SAMPLE_SIZE,
      reason,
    },

    locationStatistics: local,
    globalStatistics: global,
  };
};

module.exports = {
  getTargetSuggestion,
};
