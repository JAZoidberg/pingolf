const resultService = require("../results/result.service");
const playerService = require("../players/player.service");
const machineService = require("../machines/machine.service");
const locationService = require("../locations/location.service");

const createServiceError = (message, statusCode = 404) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  return error;
};

const calculateScoreSummary = (scores) => {
  if (scores.length === 0) {
    return {
      sampleSize: 0,
      averageScore: null,
      medianScore: null,
      minScore: null,
      maxScore: null,
    };
  }

  const sortedScores = [...scores].sort((a, b) => a - b);

  const total = sortedScores.reduce(
    (sum, score) => sum + score,
    0
  );

  const middle = Math.floor(sortedScores.length / 2);

  let medianScore;

  if (sortedScores.length % 2 === 0) {
    medianScore =
      (sortedScores[middle - 1] + sortedScores[middle]) / 2;
  } else {
    medianScore = sortedScores[middle];
  }

  return {
    sampleSize: sortedScores.length,
    averageScore: Math.round(total / sortedScores.length),
    medianScore: Math.round(medianScore),
    minScore: sortedScores[0],
    maxScore: sortedScores[sortedScores.length - 1],
  };
};

const getPlayerMachineStatistics = async (
  playerId,
  machineId
) => {
  const [player, machine] = await Promise.all([
    playerService.getPlayerById(playerId),
    machineService.getMachineById(machineId),
  ]);

  if (!player) {
    throw createServiceError("Player not found");
  }

  if (!machine) {
    throw createServiceError("Machine not found");
  }

  const scores = await resultService.getRawScores({
    playerId,
    machineId,
  });

  return {
    player: {
      id: player._id,
      displayName: player.displayName,
    },

    machine: {
      id: machine._id,
      name: machine.name,
    },

    statistics: calculateScoreSummary(scores),
  };
};

const getMachineStatistics = async (machineId) => {
  const machine = await machineService.getMachineById(machineId);

  if (!machine) {
    throw createServiceError("Machine not found");
  }

  const scores = await resultService.getRawScores({
    machineId,
  });

  return {
    machine: {
      id: machine._id,
      name: machine.name,
      manufacturer: machine.manufacturer,
      year: machine.year,
    },

    scope: "global",

    statistics: calculateScoreSummary(scores),
  };
};

const getMachineLocationStatistics = async (
  machineId,
  locationId
) => {
  const [machine, location] = await Promise.all([
    machineService.getMachineById(machineId),
    locationService.getLocationById(locationId),
  ]);

  if (!machine) {
    throw createServiceError("Machine not found");
  }

  if (!location) {
    throw createServiceError("Location not found");
  }

  const scores = await resultService.getRawScores({
    machineId,
    locationId,
  });

  return {
    machine: {
      id: machine._id,
      name: machine.name,
    },

    location: {
      id: location._id,
      name: location.name,
      city: location.city,
      state: location.state,
    },

    scope: "location",

    statistics: calculateScoreSummary(scores),
  };
};

module.exports = {
  calculateScoreSummary,
  getPlayerMachineStatistics,
  getMachineStatistics,
  getMachineLocationStatistics,
};
