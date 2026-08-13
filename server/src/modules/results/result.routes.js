const express = require("express");
const resultController = require("./result.controller");

const router = express.Router();

router.post("/", resultController.createResult);
router.get("/", resultController.getResults);
router.get("/:resultId", resultController.getResultById);

module.exports = router;
