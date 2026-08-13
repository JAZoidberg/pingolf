const express = require("express");
const locationController = require("./location.controller");

const router = express.Router();

router.post("/", locationController.createLocation);
router.get("/", locationController.getLocations);
router.get("/:locationId", locationController.getLocationById);

module.exports = router;
