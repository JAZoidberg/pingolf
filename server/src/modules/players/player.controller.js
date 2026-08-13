const playerService = require("./player.service");

const createPlayer = async (req, res) => {
  try {
    const { displayName } = req.body;

    if (!displayName || !displayName.trim()) {
      return res.status(400).json({
        error: "displayName is required",
      });
    }

    const player = await playerService.createPlayer({
      displayName,
    });

    res.status(201).json(player);
  } catch (error) {
    console.error("Failed to create player:", error);

    res.status(500).json({
      error: "Failed to create player",
    });
  }
};

const getPlayers = async (req, res) => {
  try {
    const players = await playerService.getPlayers();

    res.json(players);
  } catch (error) {
    console.error("Failed to get players:", error);

    res.status(500).json({
      error: "Failed to get players",
    });
  }
};

const getPlayerById = async (req, res) => {
  try {
    const player = await playerService.getPlayerById(req.params.playerId);

    if (!player) {
      return res.status(404).json({
        error: "Player not found",
      });
    }

    res.json(player);
  } catch (error) {
    console.error("Failed to get player:", error);

    res.status(500).json({
      error: "Failed to get player",
    });
  }
};

module.exports = {
  createPlayer,
  getPlayers,
  getPlayerById,
};
