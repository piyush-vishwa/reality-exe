const mongoose = require("mongoose");

const gameProgressSchema = new mongoose.Schema(
  {
    userKey: {
      type: String,
      required: true,
      unique: true,
      default: "local-player",
    },
    totalXp: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedToday: {
      type: [String],
      default: [],
    },
    claimedToday: {
      type: [String],
      default: [],
    },
    lastDate: {
      type: String,
      default: "",
    },
    totalCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    streak: {
      count: { type: Number, default: 0 },
      lastDate: { type: String, default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GameProgress", gameProgressSchema);