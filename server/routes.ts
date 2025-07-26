import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { surveySchema } from "@shared/schema";
import { aiService } from "./ai-service";
import { z } from "zod";
import bcrypt from "bcrypt";
import session from "express-session";

declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'magilearn-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }));

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Auth Routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, email, password, ...profileData } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        ...profileData,
      });

      // Set session
      req.session.userId = user.id;

      // Generate AI profile
      try {
        const progress = await storage.getUserProgress(user.id);
        const gameStats = await storage.getUserGameStats(user.id);
        
        const aiProfile = await aiService.generateLearningProfile({
          user,
          progress: progress || {} as any,
          gameStats: gameStats || [],
          recentActivity: {
            gamesPlayed: 0,
            skillProgress: {},
            streakDays: 0,
          }
        });

        await storage.updateUser(user.id, {
          aiLearningProfile: aiProfile,
        });
      } catch (aiError) {
        console.log("AI profile generation failed, continuing without it");
      }

      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user info" });
    }
  });

  // AI-powered recommendation endpoint
  app.get("/api/ai/recommendations", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      const progress = await storage.getUserProgress(req.session.userId);
      
      if (!user || !progress) {
        return res.status(404).json({ message: "User data not found" });
      }

      const recommendations = await aiService.getPersonalizedRecommendations(user, progress);
      res.json({ recommendations });
    } catch (error) {
      console.error("AI recommendations error:", error);
      res.status(500).json({ message: "Failed to get recommendations" });
    }
  });

  // AI profile analysis endpoint
  app.post("/api/ai/analyze-progress", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      const progress = await storage.getUserProgress(req.session.userId);
      const gameStats = await storage.getUserGameStats(req.session.userId);
      
      if (!user || !progress) {
        return res.status(404).json({ message: "User data not found" });
      }

      const aiProfile = await aiService.generateLearningProfile({
        user,
        progress,
        gameStats: gameStats || [],
        recentActivity: {
          gamesPlayed: gameStats?.length || 0,
          skillProgress: {
            math: progress.mathSkills || 0,
            english: progress.englishSkills || 0,
            science: progress.scienceSkills || 0,
            coding: progress.codingSkills || 0,
            art: progress.artSkills || 0,
          },
          streakDays: progress.learningStreak || 0,
        }
      });

      await storage.updateUser(req.session.userId, {
        aiLearningProfile: aiProfile,
      });

      res.json({ profile: aiProfile });
    } catch (error) {
      console.error("AI analysis error:", error);
      res.status(500).json({ message: "Failed to analyze progress" });
    }
  });

  // Get current user (updated to use session)
  app.get("/api/user/current", async (req: any, res) => {
    try {
      // For backward compatibility, use default user if no session
      const userId = req.session?.userId || "default-user";
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
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
