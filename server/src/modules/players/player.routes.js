const express = require("express");

const playerController = require("./player.controller");

const router = express.Router();

router.post("/", playerController.createPlayer);

router.get("/", playerController.getPlayers);

router.get("/:playerId", playerController.getPlayerById);

module.exports = router;
