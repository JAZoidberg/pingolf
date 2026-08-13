const Result = require("./result.model");

const playerService = require("../players/player.service");
const machineService = require("../machines/machine.service");
const locationService = require("../locations/location.service");

const createServiceError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  return error;
};

const createResult = async (resultData) => {
  const {
    playerId,
    machineId,
    locationId,
    rawScore,
    ballsPlayed,
    strokes,
    playedAt,
  } = resultData;

  const [player, machine, location] = await Promise.all([
    playerService.getPlayerById(playerId),
    machineService.getMachineById(machineId),
    locationService.getLocationById(locationId),
  ]);

  if (!player) {
    throw createServiceError("Player not found");
  }

  if (!machine) {
    throw createServiceError("Machine not found");
  }

  if (!location) {
    throw createServiceError("Location not found");
  }

  const result = await Result.create({
    player: playerId,
    machine: machineId,
    location: locationId,
    rawScore,
    ballsPlayed,
    strokes,
    playedAt,
  });

  return await getResultById(result._id);
};

const getResults = async (filters = {}) => {
  const query = {};

  if (filters.playerId) {
    query.player = filters.playerId;
  }

  if (filters.machineId) {
    query.machine = filters.machineId;
  }

  if (filters.locationId) {
    query.location = filters.locationId;
  }

  return await Result.find(query)
    .populate("player", "displayName")
    .populate("machine", "name manufacturer year")
    .populate("location", "name city state")
    .sort({ playedAt: -1 });
};

const getResultById = async (resultId) => {
  return await Result.findById(resultId)
    .populate("player", "displayName")
    .populate("machine", "name manufacturer year")
    .populate("location", "name city state");
};

module.exports = {
  createResult,
  getResults,
  getResultById,
};
