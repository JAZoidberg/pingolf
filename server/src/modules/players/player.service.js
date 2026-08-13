const Player = require("./player.model");

const createPlayer = async (playerData) => {
  const player = await Player.create(playerData);

  return player;
};

const getPlayers = async () => {
  const players = await Player.find().sort({ createdAt: -1 });

  return players;
};

const getPlayerById = async (playerId) => {
  const player = await Player.findById(playerId);

  return player;
};

module.exports = {
  createPlayer,
  getPlayers,
  getPlayerById,
};

