const mongoose = require("mongoose");

const holeSchema = new mongoose.Schema(
  {
    machine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Machine",
      required: true,
    },

    order: {
      type: Number,
      required: true,
      min: 1,
    },

    scoringType: {
      type: String,
      default: "scoreTarget",
    },

    targetScore: {
      type: Number,
      min: 0,
      default: null,
    },
  },
  {
    _id: true,
  }
);

const lobbySchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    hostPlayer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },

    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
      },
    ],

    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      default: null,
    },

    holes: {
      type: [holeSchema],
      default: [],
    },

    settings: {
      timeLimitMinutes: {
        type: Number,
        min: 1,
        default: null,
      },

      ballsAllowed: {
        type: Number,
        min: 1,
        default: 3,
      },

      missPenaltyStrokes: {
       type: Number,
       min: 0,
       default: 1,
      },
    },

    status: {
      type: String,
      enum: ["waiting", "playing", "finished"],
      default: "waiting",
      index: true,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    endsAt: {
      type: Date,
      default: null,
    },

    finishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Lobby = mongoose.model("Lobby", lobbySchema);

module.exports = Lobby;
