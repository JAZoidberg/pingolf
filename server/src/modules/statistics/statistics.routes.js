const express = require("express");
const statisticsController = require("./statistics.controller");

const router = express.Router();

router.get(
  "/players/:playerId/machines/:machineId",
  statisticsController.getPlayerMachineStatistics
);

router.get(
  "/machines/:machineId/locations/:locationId",
  statisticsController.getMachineLocationStatistics
);

router.get(
  "/machines/:machineId",
  statisticsController.getMachineStatistics
);

module.exports = router;
