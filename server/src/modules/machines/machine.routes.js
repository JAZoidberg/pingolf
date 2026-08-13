const express = require("express");
const machineController = require("./machine.controller");

const router = express.Router();

router.post("/", machineController.createMachine);
router.get("/", machineController.getMachines);
router.get("/:machineId", machineController.getMachineById);

module.exports = router;
