const express = require("express");
const lobbyController = require("./lobby.controller");

const router = express.Router();

router.post("/", lobbyController.createLobby);

router.get("/:code", lobbyController.getLobby);

router.get("/:code/standings", lobbyController.getLobbyStandings);

router.post("/:code/join", lobbyController.joinLobby);

router.put("/:code/setup", lobbyController.configureLobby);

router.patch("/:code/holes/:holeId/target", lobbyController.updateHoleTarget);

router.post("/:code/start", lobbyController.startLobby);

router.post("/:code/finish", lobbyController.finishLobby);

router.post("/:code/holes/:holeId/score",lobbyController.submitHoleScore);

module.exports = router;
