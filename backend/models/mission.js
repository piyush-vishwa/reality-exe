const mongoose = require("mongoose");

const missionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    xp: {
      type: Number,
      default: 10,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    category: {
      type: String,
      default: "General",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Mission", missionSchema);