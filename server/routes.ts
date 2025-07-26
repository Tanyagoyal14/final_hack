import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { surveySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current user (simplified - using default user)
  app.get("/api/user/current", async (req, res) => {
    try {
      const user = await storage.getUser("default-user");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Update user survey
  app.post("/api/user/survey", async (req, res) => {
    try {
      const surveyData = surveySchema.parse(req.body);
      const user = await storage.updateUser("default-user", {
        name: surveyData.name,
        age: surveyData.age,
        class: surveyData.class,
        specialNeed: surveyData.specialNeed,
        learningStyle: surveyData.learningStyle,
        subjects: surveyData.subjects,
        currentMood: surveyData.currentMood,
        accessibilityNeeds: surveyData.accessibilityNeeds || [],
      });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid survey data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update survey" });
    }
  });

  // Get user progress
  app.get("/api/user/progress", async (req, res) => {
    try {
      const progress = await storage.getUserProgress("default-user");
      if (!progress) {
        return res.status(404).json({ message: "Progress not found" });
      }
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to get progress" });
    }
  });

  // Get daily spins
  app.get("/api/user/spins", async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const spins = await storage.getDailySpins("default-user", today);
      
      if (!spins) {
        // Create new daily spins for today
        const newSpins = await storage.updateDailySpins("default-user", today, 0);
        return res.json(newSpins);
      }
      
      res.json(spins);
    } catch (error) {
      res.status(500).json({ message: "Failed to get spins" });
    }
  });

  // Use a spin
  app.post("/api/user/spin", async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentSpins = await storage.getDailySpins("default-user", today);
      
      if (!currentSpins || (currentSpins.spinsRemaining || 0) <= 0) {
        return res.status(400).json({ message: "No spins remaining" });
      }
      
      const updatedSpins = await storage.updateDailySpins(
        "default-user", 
        today, 
        (currentSpins.spinsUsed || 0) + 1
      );
      
      // Randomly select a game to unlock
      const availableGames = [
        "typing-dash", "grammar-builder", "code-runner", "reaction-hero", 
        "speed-sort", "word-builder", "number-crunch", "pattern-master"
      ];
      const randomGame = availableGames[Math.floor(Math.random() * availableGames.length)];
      
      // Check if game is already unlocked
      const unlockedGames = await storage.getUnlockedGames("default-user");
      const isAlreadyUnlocked = unlockedGames.some(game => game.gameId === randomGame);
      
      let unlockedGame = null;
      if (!isAlreadyUnlocked) {
        unlockedGame = await storage.unlockGame("default-user", randomGame);
      }
      
      // Award XP
      const currentProgress = await storage.getUserProgress("default-user");
      if (currentProgress) {
        await storage.updateUserProgress("default-user", {
          totalXp: (currentProgress.totalXp || 0) + 50
        });
      }
      
      res.json({
        spins: updatedSpins,
        reward: {
          type: unlockedGame ? "game" : "xp",
          gameId: unlockedGame?.gameId,
          xp: 50
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to use spin" });
    }
  });

  // Get unlocked games
  app.get("/api/user/games", async (req, res) => {
    try {
      const unlockedGames = await storage.getUnlockedGames("default-user");
      res.json(unlockedGames);
    } catch (error) {
      res.status(500).json({ message: "Failed to get games" });
    }
  });

  // Get achievements
  app.get("/api/user/achievements", async (req, res) => {
    try {
      const achievements = await storage.getUserAchievements("default-user");
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to get achievements" });
    }
  });

  // Continue learning progress
  app.post("/api/user/continue-learning", async (req, res) => {
    try {
      const currentProgress = await storage.getUserProgress("default-user");
      if (!currentProgress) {
        return res.status(404).json({ message: "Progress not found" });
      }

      // Increase all skills by 5%
      const updatedProgress = await storage.updateUserProgress("default-user", {
        totalXp: (currentProgress.totalXp || 0) + 25,
        mathSkills: Math.min(100, (currentProgress.mathSkills || 0) + 5),
        englishSkills: Math.min(100, (currentProgress.englishSkills || 0) + 5),
        scienceSkills: Math.min(100, (currentProgress.scienceSkills || 0) + 5),
        codingSkills: Math.min(100, (currentProgress.codingSkills || 0) + 5),
        artSkills: Math.min(100, (currentProgress.artSkills || 0) + 5),
        languageSkills: Math.min(100, (currentProgress.languageSkills || 0) + 5),
        problemSolving: Math.min(100, (currentProgress.problemSolving || 0) + 5),
        memorySkills: Math.min(100, (currentProgress.memorySkills || 0) + 5),
        lastActiveDate: new Date(),
      });

      res.json({ progress: updatedProgress, message: "Great progress! Keep learning!" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Play game and update stats
  app.post("/api/games/:gameId/play", async (req, res) => {
    try {
      const { gameId } = req.params;
      const { score, xpEarned } = req.body;
      
      // Update game stats
      const currentStats = await storage.getGameStats("default-user", gameId);
      const updatedStats = await storage.updateGameStats("default-user", gameId, {
        timesPlayed: (currentStats?.timesPlayed || 0) + 1,
        bestScore: Math.max(currentStats?.bestScore || 0, score || 0),
        totalXpEarned: (currentStats?.totalXpEarned || 0) + (xpEarned || 0),
      });
      
      // Update user progress
      const currentProgress = await storage.getUserProgress("default-user");
      if (currentProgress && xpEarned) {
        await storage.updateUserProgress("default-user", {
          totalXp: (currentProgress.totalXp || 0) + xpEarned,
          // Update skill based on game type
          ...(gameId.includes("math") && { mathSkills: Math.min(100, (currentProgress.mathSkills || 0) + 2) }),
          ...(gameId.includes("memory") && { memorySkills: Math.min(100, (currentProgress.memorySkills || 0) + 2) }),
          ...(gameId.includes("puzzle") && { problemSolving: Math.min(100, (currentProgress.problemSolving || 0) + 2) }),
          ...(gameId.includes("word") && { languageSkills: Math.min(100, (currentProgress.languageSkills || 0) + 2) }),
        });
      }
      
      res.json({ stats: updatedStats });
    } catch (error) {
      res.status(500).json({ message: "Failed to update game stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
