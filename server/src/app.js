const express = require("express");
const cors = require("cors");

const playerRoutes = require("./modules/players/player.routes");
const machineRoutes = require("./modules/machines/machine.routes");
const locationRoutes = require("./modules/locations/location.routes");
const resultRoutes = require("./modules/results/result.routes");
const statisticsRoutes = require("./modules/statistics/statistics.routes");
const targetRoutes = require("./modules/targets/target.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Pingolf API is running",
  });
});

app.use("/api/players", playerRoutes);
app.use("/api/machines", machineRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/targets", targetRoutes);

module.exports = app;
