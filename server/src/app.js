const express = require("express");
const cors = require("cors");

const playerRoutes = require("./modules/players/player.routes");

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

module.exports = app;
