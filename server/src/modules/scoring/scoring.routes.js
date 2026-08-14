const express = require("express");
const scoringController = require("./scoring.controller");

const router = express.Router();

router.post(
  "/calculate",
  scoringController.calculateHoleScore
);

module.exports = router;

