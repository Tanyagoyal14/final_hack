import OpenAI from "openai";
import type { User, UserProgress, GameStats } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AILearningProfile {
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  adaptiveDifficulty: number; // 1-10 scale
  preferredContentTypes: string[];
  lastAnalyzed: string;
}

export interface AIAnalysisData {
  user: User;
  progress: UserProgress;
  gameStats: GameStats[];
  recentActivity: {
    gamesPlayed: number;
    skillProgress: { [key: string]: number };
    streakDays: number;
  };
}

export class AILearningService {
  async generateLearningProfile(data: AIAnalysisData): Promise<AILearningProfile> {
    try {
      const prompt = `Analyze this student's learning data and create a personalized AI learning profile:

Student Info:
- Name: ${data.user.name}
- Age: ${data.user.age}
- Grade: ${data.user.class}
- Special Needs: ${data.user.specialNeed || 'none'}
- Learning Style: ${data.user.learningStyle}
- Current Mood: ${data.user.currentMood}
- Favorite Subjects: ${data.user.subjects?.join(', ') || 'none specified'}

Learning Progress:
- Total XP: ${data.progress?.totalXp || 0}
- Math Skills: ${data.progress?.mathSkills || 0}%
- English Skills: ${data.progress?.englishSkills || 0}%
- Science Skills: ${data.progress?.scienceSkills || 0}%
- Coding Skills: ${data.progress?.codingSkills || 0}%
- Art Skills: ${data.progress?.artSkills || 0}%
- Learning Streak: ${data.progress?.learningStreak || 0} days

Recent Activity:
- Games Played: ${data.recentActivity.gamesPlayed}
- Current Streak: ${data.recentActivity.streakDays} days

Please analyze this data and provide personalized learning insights in JSON format:
{
  "strengths": ["list of 2-3 key learning strengths"],
  "challenges": ["list of 2-3 areas needing improvement"],
  "recommendations": ["list of 3-4 specific actionable recommendations"],
  "adaptiveDifficulty": number from 1-10 (recommended difficulty level),
  "preferredContentTypes": ["list of recommended content types like visual, interactive, gamified"],
  "lastAnalyzed": "${new Date().toISOString()}"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert educational AI that analyzes student learning patterns and creates personalized learning profiles. Focus on being encouraging while providing actionable insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result as AILearningProfile;
    } catch (error) {
      console.error("AI analysis failed:", error);
      // Fallback profile
      return {
        strengths: ["Consistent learning", "Good engagement"],
        challenges: ["Continue practicing", "Try new subjects"],
        recommendations: ["Keep up daily practice", "Explore challenging content", "Mix different learning styles"],
        adaptiveDifficulty: 5,
        preferredContentTypes: ["interactive", "visual"],
        lastAnalyzed: new Date().toISOString()
      };
    }
  }

  async getPersonalizedRecommendations(user: User, progress: UserProgress): Promise<string[]> {
    try {
      const prompt = `Based on this student's profile, suggest 3 specific learning activities for today:

Student: ${user.name}, Age ${user.age}, ${user.class}
Current Mood: ${user.currentMood}
Learning Style: ${user.learningStyle}
Special Needs: ${user.specialNeed || 'none'}
Favorite Subjects: ${user.subjects?.join(', ') || 'various'}

Recent Progress:
- Math: ${progress?.mathSkills || 0}%
- English: ${progress?.englishSkills || 0}%
- Science: ${progress?.scienceSkills || 0}%
- Coding: ${progress?.codingSkills || 0}%
- Art: ${progress?.artSkills || 0}%

Respond with JSON array of 3 specific recommendations:
["activity 1", "activity 2", "activity 3"]`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an educational AI that provides personalized, age-appropriate learning recommendations. Make suggestions fun and engaging."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
      });

      const result = JSON.parse(response.choices[0].message.content || '[]');
      return result.recommendations || [];
    } catch (error) {
      console.error("Recommendation generation failed:", error);
      return [
        "Try a math puzzle game to boost problem-solving skills",
        "Read a short story and discuss it with someone",
        "Create art inspired by your favorite subject"
      ];
    }
  }

  async adaptGameDifficulty(gameId: string, userPerformance: { score: number; timeSpent: number; mistakes: number }): Promise<{
    difficulty: number;
    suggestions: string[];
  }> {
    try {
      const prompt = `Analyze this game performance and recommend difficulty adjustment:

Game: ${gameId}
Performance:
- Score: ${userPerformance.score}
- Time Spent: ${userPerformance.timeSpent} seconds
- Mistakes: ${userPerformance.mistakes}

Provide recommendations in JSON format:
{
  "difficulty": number from 1-10 (recommended difficulty level),
  "suggestions": ["specific suggestions for the student"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an adaptive learning AI that adjusts game difficulty based on student performance. Balance challenge with encouragement."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.6,
      });

      return JSON.parse(response.choices[0].message.content || '{"difficulty": 5, "suggestions": []}');
    } catch (error) {
      console.error("Difficulty adaptation failed:", error);
      return {
        difficulty: 5,
        suggestions: ["Keep practicing to improve your skills!"]
      };
    }
  }
}

export const aiService = new AILearningService();