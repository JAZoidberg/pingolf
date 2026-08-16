const crypto = require("crypto");

const Lobby = require("./lobby.model");

const playerService = require("../players/player.service");
const machineService = require("../machines/machine.service");
const locationService = require("../locations/location.service");
const targetService = require("../targets/target.service");

const CODE_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

const createServiceError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  return error;
};

const generateCode = () => {
  let code = "";

  for (let i = 0; i < CODE_LENGTH; i += 1) {
    const index = crypto.randomInt(0, CODE_CHARACTERS.length);
    code += CODE_CHARACTERS[index];
  }

  return code;
};

const generateUniqueCode = async () => {
  let code;
  let existingLobby;

  do {
    code = generateCode();
    existingLobby = await Lobby.findOne({ code });
  } while (existingLobby);

  return code;
};

const populateLobby = (query) => {
  return query
    .populate("hostPlayer", "displayName")
    .populate("players", "displayName")
    .populate("location", "name city state")
    .populate("holes.machine", "name manufacturer year");
};

const getLobbyByCode = async (code) => {
  return await populateLobby(
    Lobby.findOne({
      code: code.toUpperCase(),
    })
  );
};

const createLobby = async ({ hostPlayerId }) => {
  const hostPlayer = await playerService.getPlayerById(hostPlayerId);

  if (!hostPlayer) {
    throw createServiceError("Host player not found", 404);
  }

  const code = await generateUniqueCode();

  const lobby = await Lobby.create({
    code,
    hostPlayer: hostPlayerId,
    players: [hostPlayerId],
  });

  return await getLobbyByCode(lobby.code);
};

const joinLobby = async (code, playerId) => {
  const player = await playerService.getPlayerById(playerId);

  if (!player) {
    throw createServiceError("Player not found", 404);
  }

  const lobby = await Lobby.findOne({
    code: code.toUpperCase(),
  });

  if (!lobby) {
    throw createServiceError("Lobby not found", 404);
  }

  if (lobby.status !== "waiting") {
    throw createServiceError(
      "Players cannot join after the lobby has started"
    );
  }

  const alreadyJoined = lobby.players.some(
    (id) => id.toString() === playerId
  );

  if (!alreadyJoined) {
    lobby.players.push(playerId);
    await lobby.save();
  }

  return await getLobbyByCode(lobby.code);
};

const configureLobby = async (
  code,
  {
    hostPlayerId,
    locationId,
    machineIds,
    timeLimitMinutes,
    ballsAllowed,
    missPenaltyStrokes,
  }
) => {
  const lobby = await Lobby.findOne({
    code: code.toUpperCase(),
  });

  if (!lobby) {
    throw createServiceError("Lobby not found", 404);
  }

  if (lobby.hostPlayer.toString() !== hostPlayerId) {
    throw createServiceError(
      "Only the lobby host can change lobby settings",
      403
    );
  }

  if (lobby.status !== "waiting") {
    throw createServiceError(
      "Lobby settings cannot be changed after play begins"
    );
  }

  const location = await locationService.getLocationById(locationId);

  if (!location) {
    throw createServiceError("Location not found", 404);
  }

  if (!Array.isArray(machineIds) || machineIds.length === 0) {
    throw createServiceError(
      "At least one machine is required"
    );
  }

  const machines = await Promise.all(
    machineIds.map((machineId) =>
      machineService.getMachineById(machineId)
    )
  );

  if (machines.some((machine) => !machine)) {
    throw createServiceError(
      "One or more machines were not found",
      404
    );
  }

  lobby.location = locationId;

  lobby.holes = await Promise.all(
  machineIds.map(async (machineId, index) => {
    const targetSuggestion =
      await targetService.getTargetSuggestion(
        machineId,
        locationId
      );

    return {
      machine: machineId,
      order: index + 1,
      scoringType: "scoreTarget",
      targetScore:
        targetSuggestion.recommendation.suggestedTarget,
    };
  })
);

  if (
    timeLimitMinutes !== undefined &&
    timeLimitMinutes !== null
  ) {
    lobby.settings.timeLimitMinutes = timeLimitMinutes;
  } else {
    lobby.settings.timeLimitMinutes = null;
  }

  if (ballsAllowed !== undefined) {
    lobby.settings.ballsAllowed = ballsAllowed;
  }

  if (missPenaltyStrokes !== undefined) {
    lobby.settings.missPenaltyStrokes = missPenaltyStrokes;
  }

  await lobby.save();

  return await getLobbyByCode(lobby.code);
};

const updateHoleTarget = async (
  code,
  holeId,
  hostPlayerId,
  targetScore
) => {
  const lobby = await Lobby.findOne({
    code: code.toUpperCase(),
  });

  if (!lobby) {
    throw createServiceError("Lobby not found", 404);
  }

  if (
    lobby.hostPlayer.toString() !==
    hostPlayerId.toString()
  ) {
    throw createServiceError(
      "Only the lobby host can change hole targets",
      403
    );
  }

  if (lobby.status !== "waiting") {
    throw createServiceError(
      "Hole targets cannot be changed after play begins"
    );
  }

  if (
    typeof targetScore !== "number" ||
    !Number.isFinite(targetScore) ||
    targetScore <= 0
  ) {
    throw createServiceError(
      "targetScore must be a positive number"
    );
  }

  const hole = lobby.holes.id(holeId);

  if (!hole) {
    throw createServiceError("Hole not found", 404);
  }

  hole.targetScore = targetScore;

  await lobby.save();

  return await getLobbyByCode(lobby.code);
};

const startLobby = async (code, hostPlayerId) => {
  const lobby = await Lobby.findOne({
    code: code.toUpperCase(),
  });

  if (!lobby) {
    throw createServiceError("Lobby not found", 404);
  }

  if (lobby.hostPlayer.toString() !== hostPlayerId) {
    throw createServiceError(
      "Only the lobby host can start the lobby",
      403
    );
  }

  if (lobby.status !== "waiting") {
    throw createServiceError("Lobby has already started");
  }

  if (!lobby.location) {
    throw createServiceError(
      "A location must be selected before starting"
    );
  }

  if (lobby.holes.length === 0) {
    throw createServiceError(
      "At least one machine must be selected before starting"
    );
  }

  const holesMissingTargets = lobby.holes.filter(
    (hole) =>
      hole.scoringType === "scoreTarget" &&
      (
        typeof hole.targetScore !== "number" ||
        hole.targetScore <= 0
      )
  );

  if (holesMissingTargets.length > 0) {
    throw createServiceError(
      "Every score-target hole must have a target score before starting"
    );
  }

  lobby.status = "playing";
  lobby.startedAt = new Date();

  if (lobby.settings.timeLimitMinutes) {
    lobby.endsAt = new Date(
      lobby.startedAt.getTime() +
        lobby.settings.timeLimitMinutes * 60 * 1000
    );
  }

  await lobby.save();

  return await getLobbyByCode(lobby.code);
};

module.exports = {
  createLobby,
  getLobbyByCode,
  joinLobby,
  configureLobby,
  updateHoleTarget,
  startLobby,
};
