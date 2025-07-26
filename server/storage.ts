import { 
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
      username: "Alex",
      password: "password",
      name: "Alex Martinez",
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
    
    // Initialize progress
    const progress: UserProgress = {
      id: randomUUID(),
      userId: defaultUser.id,
      totalXp: 1247,
      mathSkills: 78,
      englishSkills: 65,
      scienceSkills: 70,
      codingSkills: 45,
      artSkills: 85,
      languageSkills: 65,
      problemSolving: 82,
      memorySkills: 71,
      learningStreak: 5,
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
      ...insertUser, 
      id,
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
      lastPlayed: new Date(),
    };
    
    userStats.set(gameId, updated);
    return updated;
  }
}

export const storage = new MemStorage();
