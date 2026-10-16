require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Mission = require("./models/mission");

const GameProgress = require("./models/GameProgress")
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("REALITY.EXE backend is running!");
});

// Get all missions
app.get("/api/missions", async (req, res) => {
  try {
    const missions = await Mission.find().sort({ createdAt: -1 });
    res.json(missions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a mission
app.post("/api/missions", async (req, res) => {
  try {
    const { title, description = "", xp = 10, category = "General" } =
      req.body || {};

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Mission title is required",
      });
    }

    if (title.trim().length > 100) {
      return res.status(400).json({
        message: "Mission title must be 100 characters or less",
      });
    }

    if (!Number.isInteger(xp) || xp < 1 || xp > 100) {
      return res.status(400).json({
        message: "XP must be a whole number between 1 and 100",
      });
    }

    if (
      typeof description !== "string" ||
      description.length > 500
    ) {
      return res.status(400).json({
        message: "Description must be 500 characters or less",
      });
    }

    if (typeof category !== "string" || category.length > 50) {
      return res.status(400).json({
        message: "Category must be 50 characters or less",
      });
    }

    const mission = await Mission.create({
      title: title.trim(),
      description: description.trim(),
      xp,
      category: category.trim() || "General",
    });

    res.status(201).json(mission);
  } catch (error) {
    console.error("Mission creation failed:", error);

    res.status(500).json({
      message: "Could not create mission",
    });
  }
});
const DEFAULT_MISSION_IDS = [];

// Delete a custom mission by its MongoDB ID.
app.delete("/api/missions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid mission ID",
      });
    }

    const deletedMission = await Mission.findByIdAndDelete(id);

    if (!deletedMission) {
      return res.status(404).json({
        message: "Mission not found",
      });
    }

    // Remove the deleted mission ID from saved progress.
    await GameProgress.updateOne(
      { userKey: "local-player" },
      {
        $pull: {
          completedToday: id,
          claimedToday: id,
        },
      }
    );

    res.json({
      message: "Mission deleted successfully",
      id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
const DEFAULT_PROGRESS = {
  totalXp: 0,
  completedToday: [],
  claimedToday: [],
  lastDate: "",
  totalCompleted: 0,
  streak: { count: 0, lastDate: null },
};

// Load saved game progress
app.get("/api/progress", async (req, res) => {
  try {
    let progress = await GameProgress.findOne({
      userKey: "local-player",
    });

    if (!progress) {
      progress = await GameProgress.create({
        userKey: "local-player",
        ...DEFAULT_PROGRESS,
      });
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Save game progress
app.put("/api/progress", async (req, res) => {
  try {
    const {
      totalXp,
      completedToday,
      claimedToday,
      lastDate,
      totalCompleted,
      streak,
    } = req.body || {};

    if (
      !Number.isFinite(totalXp) ||
      totalXp < 0 ||
      !Number.isFinite(totalCompleted) ||
      totalCompleted < 0 ||
      !Array.isArray(completedToday) ||
      !Array.isArray(claimedToday) ||
      typeof lastDate !== "string" ||
      !streak ||
      !Number.isFinite(streak.count) ||
      streak.count < 0 ||
      !(
        typeof streak.lastDate === "string" ||
        streak.lastDate === null
      )
    ) {
      return res.status(400).json({
        message: "Invalid game progress data",
      });
    }

    const progress = await GameProgress.findOneAndUpdate(
      { userKey: "local-player" },
      {
        $set: {
          totalXp,
          completedToday,
          claimedToday,
          lastDate,
          totalCompleted,
          streak,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/progress-test",(req,res)=>{
    res.json({message:"progress route is working"})
})

// Connect database, then start server
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}



startServer();