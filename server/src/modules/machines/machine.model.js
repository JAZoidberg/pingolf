const mongoose = require("mongoose");

const machineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    manufacturer: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    year: {
      type: Number,
      min: 1930,
    },
  },
  {
    timestamps: true,
  }
);

const Machine = mongoose.model("Machine", machineSchema);

module.exports = Machine;

