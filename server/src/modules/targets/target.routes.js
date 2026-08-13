const express = require("express");
const targetController = require("./target.controller");

const router = express.Router();

router.get(
  "/machines/:machineId/locations/:locationId",
  targetController.getTargetSuggestion
);

module.exports = router;
