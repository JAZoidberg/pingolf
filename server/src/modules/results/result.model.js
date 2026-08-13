const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
      index: true,
    },

    machine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Machine",
      required: true,
      index: true,
    },

    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
      index: true,
    },

    rawScore: {
      type: Number,
      required: true,
      min: 0,
    },

    ballsPlayed: {
      type: Number,
      min: 1,
    },

    strokes: {
      type: Number,
      min: 1,
    },

    playedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

resultSchema.index({ player: 1, playedAt: -1 });
resultSchema.index({ machine: 1, location: 1, playedAt: -1 });

const Result = mongoose.model("Result", resultSchema);

module.exports = Result;
