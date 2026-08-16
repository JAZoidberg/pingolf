const lobbyService = require("./lobby.service");

const handleError = (res, error) => {
  console.error("Lobby error:", error);

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
    error: "Lobby operation failed",
  });
};

const createLobby = async (req, res) => {
  try {
    const { hostPlayerId } = req.body;

    if (!hostPlayerId) {
      return res.status(400).json({
        error: "hostPlayerId is required",
      });
    }

    const lobby = await lobbyService.createLobby({
      hostPlayerId,
    });

    res.status(201).json(lobby);
  } catch (error) {
    handleError(res, error);
  }
};

const getLobby = async (req, res) => {
  try {
    const lobby = await lobbyService.getLobbyByCode(
      req.params.code
    );

    if (!lobby) {
      return res.status(404).json({
        error: "Lobby not found",
      });
    }

    res.json(lobby);
  } catch (error) {
    handleError(res, error);
  }
};

const joinLobby = async (req, res) => {
  try {
    const { playerId } = req.body;

    if (!playerId) {
      return res.status(400).json({
        error: "playerId is required",
      });
    }

    const lobby = await lobbyService.joinLobby(
      req.params.code,
      playerId
    );

    res.json(lobby);
  } catch (error) {
    handleError(res, error);
  }
};

const configureLobby = async (req, res) => {
  try {
    const {
      hostPlayerId,
      locationId,
      machineIds,
      timeLimitMinutes,
      ballsAllowed,
      missPenaltyStrokes,
    } = req.body;

    if (!hostPlayerId || !locationId) {
      return res.status(400).json({
        error: "hostPlayerId and locationId are required",
      });
    }

    const lobby = await lobbyService.configureLobby(
      req.params.code,
      {
        hostPlayerId,
        locationId,
        machineIds,
        timeLimitMinutes,
        ballsAllowed,
    	missPenaltyStrokes,
      }
    );

    res.json(lobby);
  } catch (error) {
    handleError(res, error);
  }
};

const updateHoleTarget = async (req, res) => {
  try {
    const { hostPlayerId, targetScore } = req.body;

    if (!hostPlayerId) {
      return res.status(400).json({
        error: "hostPlayerId is required",
      });
    }

    if (targetScore === undefined) {
      return res.status(400).json({
        error: "targetScore is required",
      });
    }

    const lobby =
      await lobbyService.updateHoleTarget(
        req.params.code,
        req.params.holeId,
        hostPlayerId,
        targetScore
      );

    res.json(lobby);
  } catch (error) {
    handleError(res, error);
  }
};

const startLobby = async (req, res) => {
  try {
    const { hostPlayerId } = req.body;

    if (!hostPlayerId) {
      return res.status(400).json({
        error: "hostPlayerId is required",
      });
    }

    const lobby = await lobbyService.startLobby(
      req.params.code,
      hostPlayerId
    );

    res.json(lobby);
  } catch (error) {
    handleError(res, error);
  }
};

const submitHoleScore = async (req, res) => {
  try {
    const {
      playerId,
      ballScores,
    } = req.body;

    if (!playerId) {
      return res.status(400).json({
        error: "playerId is required",
      });
    }

    if (!Array.isArray(ballScores)) {
      return res.status(400).json({
        error: "ballScores must be an array",
      });
    }

    const result =
      await lobbyService.submitHoleScore(
        req.params.code,
        req.params.holeId,
        {
          playerId,
          ballScores,
        }
      );

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  createLobby,
  getLobby,
  joinLobby,
  configureLobby,
  updateHoleTarget,
  startLobby,
  submitHoleScore,
};
