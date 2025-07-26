import { 
  users,
  userProgress,
  dailySpins,
  unlockedGames,
  achievements,
  gameStats,
  type User, 
  type InsertUser, 
  type UserProgress,
  type DailySpins,
  type UnlockedGame,
  type Achievement,
  type GameStats,
  type SurveyData
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // User progress
  getUserProgress(userId: string): Promise<UserProgress | undefined>;
  updateUserProgress(userId: string, progress: Partial<UserProgress>): Promise<UserProgress>;

  // Daily spins
  getDailySpins(userId: string, date: string): Promise<DailySpins | undefined>;
  updateDailySpins(userId: string, date: string, spinsUsed: number): Promise<DailySpins>;

  // Unlocked games
  getUnlockedGames(userId: string): Promise<UnlockedGame[]>;
  unlockGame(userId: string, gameId: string): Promise<UnlockedGame>;

  // Achievements
  getUserAchievements(userId: string): Promise<Achievement[]>;
  addAchievement(userId: string, achievementId: string, title: string, description: string): Promise<Achievement>;

  // Game stats
  getGameStats(userId: string, gameId: string): Promise<GameStats | undefined>;
  updateGameStats(userId: string, gameId: string, stats: Partial<GameStats>): Promise<GameStats>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    try {
      // Check if default user exists
      const existingUser = await this.getUser("default-user");
      if (existingUser) {
        return; // Data already initialized
      }

      // Create default user with enhanced survey data
      const defaultUser: InsertUser = {
        username: "Tanya",
        password: "password",
        name: "Tanya Goyal",
        age: 10,
        class: "5th Grade",
        specialNeed: "adhd",
        learningStyle: "visual",
        interests: ["math", "puzzles"],
        subjects: ["math", "science", "art"],
        currentMood: "happy",
        accessibilityNeeds: [],
      };

      const userWithId = { ...defaultUser, id: "default-user" } as InsertUser & { id: string };
      await this.createUser(userWithId);

      // Create initial progress starting at 0%
      await this.updateUserProgress("default-user", {
        totalXp: 0,
        mathSkills: 0,
        englishSkills: 0,
        scienceSkills: 0,
        codingSkills: 0,
        artSkills: 0,
        languageSkills: 0,
        problemSolving: 0,
        memorySkills: 0,
        learningStreak: 0,
        lastActiveDate: new Date(),
      });

      // Initialize daily spins
      const today = new Date().toISOString().split('T')[0];
      await this.updateDailySpins("default-user", today, 0);

      // Unlock some initial games
      const gamesToUnlock = ["math-ninja", "memory-flip"];
      for (const gameId of gamesToUnlock) {
        await this.unlockGame("default-user", gameId);
      }

      // Add some achievements
      await this.addAchievement("default-user", "first-steps", "First Steps", "Started your learning journey!");
      await this.addAchievement("default-user", "math-master", "Math Master", "Completed 10 math problems!");

      console.log("✅ Default data initialized successfully");
    } catch (error) {
      console.error("❌ Error initializing default data:", error);
    }
  }
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values([insertUser])
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getUserProgress(userId: string): Promise<UserProgress | undefined> {
    const [progress] = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
    return progress || undefined;
  }

  async updateUserProgress(userId: string, progressUpdates: Partial<UserProgress>): Promise<UserProgress> {
    const existing = await this.getUserProgress(userId);
    
    if (existing) {
      const [updated] = await db
        .update(userProgress)
        .set(progressUpdates)
        .where(eq(userProgress.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userProgress)
        .values({
          id: randomUUID(),
          userId,
          ...progressUpdates,
        })
        .returning();
      return created;
    }
  }

  async getDailySpins(userId: string, date: string): Promise<DailySpins | undefined> {
    const [spins] = await db
      .select()
      .from(dailySpins)
      .where(and(eq(dailySpins.userId, userId), eq(dailySpins.date, date)));
    return spins || undefined;
  }

  async updateDailySpins(userId: string, date: string, spinsUsed: number): Promise<DailySpins> {
    const existing = await this.getDailySpins(userId, date);
    
    if (existing) {
      const [updated] = await db
        .update(dailySpins)
        .set({ 
          spinsUsed,
          spinsRemaining: Math.max(0, 3 - spinsUsed)
        })
        .where(and(eq(dailySpins.userId, userId), eq(dailySpins.date, date)))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(dailySpins)
        .values({
          id: randomUUID(),
          userId,
          date,
          spinsUsed,
          spinsRemaining: Math.max(0, 3 - spinsUsed),
        })
        .returning();
      return created;
    }
  }

  async getUnlockedGames(userId: string): Promise<UnlockedGame[]> {
    return await db.select().from(unlockedGames).where(eq(unlockedGames.userId, userId));
  }

  async unlockGame(userId: string, gameId: string): Promise<UnlockedGame> {
    const [game] = await db
      .insert(unlockedGames)
      .values({
        id: randomUUID(),
        userId,
        gameId,
      })
      .returning();
    return game;
  }

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return await db.select().from(achievements).where(eq(achievements.userId, userId));
  }

  async addAchievement(userId: string, achievementId: string, title: string, description: string): Promise<Achievement> {
    const [achievement] = await db
      .insert(achievements)
      .values({
        id: randomUUID(),
        userId,
        achievementId,
        title,
        description,
      })
      .returning();
    return achievement;
  }

  async getGameStats(userId: string, gameId: string): Promise<GameStats | undefined> {
    const [stats] = await db
      .select()
      .from(gameStats)
      .where(and(eq(gameStats.userId, userId), eq(gameStats.gameId, gameId)));
    return stats || undefined;
  }

  async updateGameStats(userId: string, gameId: string, statsUpdates: Partial<GameStats>): Promise<GameStats> {
    const existing = await this.getGameStats(userId, gameId);
    
    if (existing) {
      const [updated] = await db
        .update(gameStats)
        .set(statsUpdates)
        .where(and(eq(gameStats.userId, userId), eq(gameStats.gameId, gameId)))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(gameStats)
        .values({
          id: randomUUID(),
          userId,
          gameId,
          ...statsUpdates,
        })
        .returning();
      return created;
    }
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private userProgress: Map<string, UserProgress>;
  private dailySpins: Map<string, DailySpins>;
  private unlockedGames: Map<string, UnlockedGame[]>;
  private achievements: Map<string, Achievement[]>;
  private gameStats: Map<string, Map<string, GameStats>>;

  constructor() {
    this.users = new Map();
    this.userProgress = new Map();
    this.dailySpins = new Map();
    this.unlockedGames = new Map();
    this.achievements = new Map();
    this.gameStats = new Map();

    // Create a default user for demo
    this.initializeDefaultUser();
  }

  private async initializeDefaultUser() {
    const defaultUser: User = {
      id: "default-user",
      username: "Tanya",
      password: "password",
      name: "Tanya Goyal",
      age: 10,
      class: "5th Grade",
      specialNeed: "adhd",
      learningStyle: "visual",
      interests: ["math", "puzzles"],
      subjects: ["math", "science", "art"],
      currentMood: "happy",
      accessibilityNeeds: [],
      createdAt: new Date(),
    };
    
    this.users.set(defaultUser.id, defaultUser);
    
    // Initialize progress starting at 0%
    const progress: UserProgress = {
      id: randomUUID(),
      userId: defaultUser.id,
      totalXp: 0,
      mathSkills: 0,
      englishSkills: 0,
      scienceSkills: 0,
      codingSkills: 0,
      artSkills: 0,
      languageSkills: 0,
      problemSolving: 0,
      memorySkills: 0,
      learningStreak: 0,
      lastActiveDate: new Date(),
    };
    this.userProgress.set(defaultUser.id, progress);

    // Initialize daily spins
    const today = new Date().toISOString().split('T')[0];
    const spins: DailySpins = {
      id: randomUUID(),
      userId: defaultUser.id,
      date: today,
      spinsUsed: 1,
      spinsRemaining: 2,
    };
    this.dailySpins.set(`${defaultUser.id}-${today}`, spins);

    // Initialize some unlocked games
    const unlockedGamesList: UnlockedGame[] = [
      {
        id: randomUUID(),
        userId: defaultUser.id,
        gameId: "math-ninja",
        unlockedAt: new Date(),
      },
      {
        id: randomUUID(),
        userId: defaultUser.id,
        gameId: "memory-flip",
        unlockedAt: new Date(),
      },
      {
        id: randomUUID(),
        userId: defaultUser.id,
        gameId: "puzzle-portal",
        unlockedAt: new Date(),
      },
      {
        id: randomUUID(),
        userId: defaultUser.id,
        gameId: "quiz-attack",
        unlockedAt: new Date(),
      },
      {
        id: randomUUID(),
        userId: defaultUser.id,
        gameId: "color-match",
        unlockedAt: new Date(),
      },
    ];
    this.unlockedGames.set(defaultUser.id, unlockedGamesList);

    // Initialize achievements
    const achievementsList: Achievement[] = [
      {
        id: randomUUID(),
        userId: defaultUser.id,
        achievementId: "math-master",
        title: "Math Master",
        description: "Completed 10 math games!",
        earnedAt: new Date(),
      },
      {
        id: randomUUID(),
        userId: defaultUser.id,
        achievementId: "5-day-streak",
        title: "5-Day Streak",
        description: "Learning every day!",
        earnedAt: new Date(),
      },
      {
        id: randomUUID(),
        userId: defaultUser.id,
        achievementId: "first-spin",
        title: "First Spin",
        description: "Unlocked your first game!",
        earnedAt: new Date(),
      },
    ];
    this.achievements.set(defaultUser.id, achievementsList);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      name: insertUser.name || null,
      age: insertUser.age || null,
      class: insertUser.class || null,
      specialNeed: insertUser.specialNeed || null,
      learningStyle: insertUser.learningStyle || null,
      interests: (insertUser.interests as string[]) || null,
      subjects: (insertUser.subjects as string[]) || null,
      currentMood: insertUser.currentMood || null,
      accessibilityNeeds: (insertUser.accessibilityNeeds as string[]) || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUserProgress(userId: string): Promise<UserProgress | undefined> {
    return this.userProgress.get(userId);
  }

  async updateUserProgress(userId: string, progress: Partial<UserProgress>): Promise<UserProgress> {
    const existing = this.userProgress.get(userId);
    const updated: UserProgress = {
      id: existing?.id || randomUUID(),
      userId,
      totalXp: 0,
      mathSkills: 0,
      englishSkills: 0,
      scienceSkills: 0,
      codingSkills: 0,
      artSkills: 0,
      languageSkills: 0,
      problemSolving: 0,
      memorySkills: 0,
      learningStreak: 0,
      lastActiveDate: null,
      ...existing,
      ...progress,
    };
    this.userProgress.set(userId, updated);
    return updated;
  }

  async getDailySpins(userId: string, date: string): Promise<DailySpins | undefined> {
    return this.dailySpins.get(`${userId}-${date}`);
  }

  async updateDailySpins(userId: string, date: string, spinsUsed: number): Promise<DailySpins> {
    const key = `${userId}-${date}`;
    const existing = this.dailySpins.get(key);
    const updated: DailySpins = {
      id: existing?.id || randomUUID(),
      userId,
      date,
      spinsUsed,
      spinsRemaining: Math.max(0, 3 - spinsUsed),
      ...existing,
    };
    this.dailySpins.set(key, updated);
    return updated;
  }

  async getUnlockedGames(userId: string): Promise<UnlockedGame[]> {
    return this.unlockedGames.get(userId) || [];
  }

  async unlockGame(userId: string, gameId: string): Promise<UnlockedGame> {
    const unlockedGame: UnlockedGame = {
      id: randomUUID(),
      userId,
      gameId,
      unlockedAt: new Date(),
    };
    
    const existing = this.unlockedGames.get(userId) || [];
    existing.push(unlockedGame);
    this.unlockedGames.set(userId, existing);
    
    return unlockedGame;
  }

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return this.achievements.get(userId) || [];
  }

  async addAchievement(userId: string, achievementId: string, title: string, description: string): Promise<Achievement> {
    const achievement: Achievement = {
      id: randomUUID(),
      userId,
      achievementId,
      title,
      description,
      earnedAt: new Date(),
    };
    
    const existing = this.achievements.get(userId) || [];
    existing.push(achievement);
    this.achievements.set(userId, existing);
    
    return achievement;
  }

  async getGameStats(userId: string, gameId: string): Promise<GameStats | undefined> {
    const userStats = this.gameStats.get(userId);
    return userStats?.get(gameId);
  }

  async updateGameStats(userId: string, gameId: string, stats: Partial<GameStats>): Promise<GameStats> {
    if (!this.gameStats.has(userId)) {
      this.gameStats.set(userId, new Map());
    }
    
    const userStats = this.gameStats.get(userId)!;
    const existing = userStats.get(gameId);
    
    const updated: GameStats = {
      id: existing?.id || randomUUID(),
      userId,
      gameId,
      timesPlayed: 0,
      bestScore: 0,
      totalXpEarned: 0,
      lastPlayed: null,
      ...existing,
      ...stats,
    };
    
    userStats.set(gameId, updated);
    return updated;
  }
}

export const storage = new DatabaseStorage();
