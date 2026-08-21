const crypto = require("crypto");

const Lobby = require("./lobby.model");

const playerService = require("../players/player.service");
const machineService = require("../machines/machine.service");
const locationService = require("../locations/location.service");
const targetService = require("../targets/target.service");
const scoringService = require("../scoring/scoring.service");
const resultService = require("../results/result.service");

const CODE_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

const createServiceError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  return error;
};

const markLobbyFinished = async (lobby) => {
  lobby.status = "finished";
  lobby.finishedAt = new Date();

  await lobby.save();
};

const maybeFinishLobby = async (lobby) => {
  const expectedResults =
    lobby.players.length * lobby.holes.length;

  if (expectedResults === 0) {
    return false;
  }

  const completedResults =
    await resultService.countLobbyResults(
      lobby._id
    );

  if (completedResults < expectedResults) {
    return false;
  }

  await markLobbyFinished(lobby);

  return true;
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

const getLobbyStandings = async (code) => {
  const lobby = await getLobbyByCode(code);

  if (!lobby) {
    throw createServiceError("Lobby not found", 404);
  }

  const results = await resultService.getResults({
    lobbyId: lobby._id,
  });

  const holes = [...lobby.holes].sort(
    (a, b) => a.order - b.order
  );

  const resultMap = new Map();

  results.forEach((result) => {
    if (!result.player || !result.holeId) {
      return;
    }

    const key =
      `${result.player._id.toString()}:` +
      `${result.holeId.toString()}`;

    resultMap.set(key, result);
  });

  const standings = lobby.players.map((player) => {
    const playerId = player._id.toString();

    const scorecard = holes.map((hole) => {
      const key =
        `${playerId}:${hole._id.toString()}`;

      const result = resultMap.get(key);

      return {
        holeId: hole._id,
        order: hole.order,

        machine: {
          id: hole.machine._id,
          name: hole.machine.name,
        },

        targetScore: hole.targetScore,

        completed: Boolean(result),

        rawScore: result
          ? result.rawScore
          : null,

        ballsPlayed: result
          ? result.ballsPlayed
          : null,

        strokes: result
          ? result.strokes
          : null,
      };
    });

    const completedHoles = scorecard.filter(
      (hole) => hole.completed
    );

    const totalStrokes = completedHoles.reduce(
      (total, hole) => total + hole.strokes,
      0
    );

    return {
      player: {
        id: player._id,
        displayName: player.displayName,
      },

      holesCompleted: completedHoles.length,
      totalHoles: holes.length,

      isComplete:
        holes.length > 0 &&
        completedHoles.length === holes.length,

      totalStrokes,

      scorecard,
    };
  });

  standings.sort((a, b) => {
    if (a.holesCompleted !== b.holesCompleted) {
      return b.holesCompleted - a.holesCompleted;
    }

    return a.totalStrokes - b.totalStrokes;
  });

  return {
    code: lobby.code,
    status: lobby.status,

    location: lobby.location
      ? {
          id: lobby.location._id,
          name: lobby.location.name,
          city: lobby.location.city,
          state: lobby.location.state,
        }
      : null,

    totalHoles: holes.length,

    standings,
  };
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

const finishLobby = async (
  code,
  hostPlayerId
) => {
  const lobby = await Lobby.findOne({
    code: code.toUpperCase(),
  });

  if (!lobby) {
    throw createServiceError(
      "Lobby not found",
      404
    );
  }

  if (
    lobby.hostPlayer.toString() !==
    hostPlayerId.toString()
  ) {
    throw createServiceError(
      "Only the lobby host can finish the lobby",
      403
    );
  }

  if (lobby.status === "waiting") {
    throw createServiceError(
      "Lobby must be started before it can be finished"
    );
  }

  if (lobby.status === "finished") {
    return await getLobbyByCode(lobby.code);
  }

  await markLobbyFinished(lobby);

  return await getLobbyByCode(lobby.code);
};

const submitHoleScore = async (
  code,
  holeId,
  {
    playerId,
    ballScores,
  }
) => {
  const lobby = await Lobby.findOne({
    code: code.toUpperCase(),
  });

  if (!lobby) {
    throw createServiceError("Lobby not found", 404);
  }

  if (lobby.status !== "playing") {
    throw createServiceError(
      "Scores can only be submitted while the lobby is playing"
    );
  }

  const playerIsInLobby = lobby.players.some(
    (id) => id.toString() === playerId.toString()
  );

  if (!playerIsInLobby) {
    throw createServiceError(
      "Player is not part of this lobby",
      403
    );
  }

  const hole = lobby.holes.id(holeId);

  if (!hole) {
    throw createServiceError("Hole not found", 404);
  }

  const existingResult =
    await resultService.getLobbyHoleResult(
      lobby._id,
      hole._id,
      playerId
    );

  if (existingResult) {
    throw createServiceError(
      "Player has already completed this hole",
      409
    );
  }

  const scoringResult =
    scoringService.calculateHoleScore({
      scoringType: hole.scoringType,
      targetScore: hole.targetScore,
      ballScores,
      ballsAllowed: lobby.settings.ballsAllowed,
      missPenaltyStrokes:
        lobby.settings.missPenaltyStrokes,
    });

  if (scoringResult.status === "in_progress") {
    return {
      scoring: scoringResult,
      result: null,
    };
  }

  const result = await resultService.createResult({
  playerId,
  machineId: hole.machine,
  locationId: lobby.location,
  lobbyId: lobby._id,
  holeId: hole._id,
  scoringType: hole.scoringType,
  targetScore: hole.targetScore,
  rawScore: scoringResult.rawScore,
  ballsPlayed: scoringResult.ballsPlayed,
  strokes: scoringResult.strokes,
});

const roundFinished =
  await maybeFinishLobby(lobby);

return {
  scoring: scoringResult,
  result,
  roundFinished,
  lobbyStatus: lobby.status,
};
};

module.exports = {
  createLobby,
  getLobbyByCode,
  getLobbyStandings,
  joinLobby,
  configureLobby,
  updateHoleTarget,
  startLobby,
  finishLobby,
  submitHoleScore,
};
