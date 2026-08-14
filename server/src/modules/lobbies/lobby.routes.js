const express = require("express");
const lobbyController = require("./lobby.controller");

const router = express.Router();

router.post("/", lobbyController.createLobby);

router.get("/:code", lobbyController.getLobby);

router.post("/:code/join", lobbyController.joinLobby);

router.put("/:code/setup", lobbyController.configureLobby);

router.post("/:code/start", lobbyController.startLobby);

module.exports = router;
