import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  name: text("name"),
  age: integer("age"),
  class: text("class"),
  specialNeed: text("special_need"),
  learningStyle: text("learning_style"),
  interests: jsonb("interests").$type<string[]>(),
  subjects: jsonb("subjects").$type<string[]>(),
  currentMood: text("current_mood"),
  accessibilityNeeds: jsonb("accessibility_needs").$type<string[]>(),
  aiLearningProfile: jsonb("ai_learning_profile").$type<{
    strengths: string[];
    challenges: string[];
    recommendations: string[];
    adaptiveDifficulty: number;
    preferredContentTypes: string[];
    lastAnalyzed: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  totalXp: integer("total_xp").default(0),
  mathSkills: integer("math_skills").default(0),
  englishSkills: integer("english_skills").default(0),
  scienceSkills: integer("science_skills").default(0),
  codingSkills: integer("coding_skills").default(0),
  artSkills: integer("art_skills").default(0),
  languageSkills: integer("language_skills").default(0),
  problemSolving: integer("problem_solving").default(0),
  memorySkills: integer("memory_skills").default(0),
  learningStreak: integer("learning_streak").default(0),
  lastActiveDate: timestamp("last_active_date"),
});

export const dailySpins = pgTable("daily_spins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  spinsUsed: integer("spins_used").default(0),
  spinsRemaining: integer("spins_remaining").default(3),
});

export const unlockedGames = pgTable("unlocked_games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  gameId: text("game_id").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  achievementId: text("achievement_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const gameStats = pgTable("game_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  gameId: text("game_id").notNull(),
  timesPlayed: integer("times_played").default(0),
  bestScore: integer("best_score").default(0),
  totalXpEarned: integer("total_xp_earned").default(0),
  lastPlayed: timestamp("last_played"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
}).partial({ id: true });

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
});

export const insertDailySpinsSchema = createInsertSchema(dailySpins).omit({
  id: true,
});

export const insertUnlockedGameSchema = createInsertSchema(unlockedGames).omit({
  id: true,
  unlockedAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  earnedAt: true,
});

export const insertGameStatsSchema = createInsertSchema(gameStats).omit({
  id: true,
  lastPlayed: true,
});

// Survey schema
export const surveySchema = z.object({
  name: z.string().min(1),
  age: z.number().min(6).max(18),
  class: z.string().min(1),
  specialNeed: z.enum(["autism", "adhd", "dyslexia", "physical", "other"]),
  learningStyle: z.enum(["visual", "auditory", "kinesthetic"]),
  subjects: z.array(z.string()).min(1),
  currentMood: z.string(),
  accessibilityNeeds: z.array(z.string()).optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type DailySpins = typeof dailySpins.$inferSelect;
export type UnlockedGame = typeof unlockedGames.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type GameStats = typeof gameStats.$inferSelect;
export type SurveyData = z.infer<typeof surveySchema>;
