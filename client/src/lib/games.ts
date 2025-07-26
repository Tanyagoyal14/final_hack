export interface Game {
  id: string;
  title: string;
  description: string;
  xp: number;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  color: "blue" | "green" | "purple" | "red" | "yellow" | "pink" | "indigo" | "orange";
}

export const AVAILABLE_GAMES: Game[] = [
  {
    id: "math-ninja",
    title: "Math Ninja",
    description: "Master addition and subtraction!",
    xp: 50,
    category: "Math",
    difficulty: "easy",
    color: "blue"
  },
  {
    id: "typing-dash",
    title: "Typing Dash",
    description: "Improve your typing speed!",
    xp: 40,
    category: "Language",
    difficulty: "medium",
    color: "green"
  },
  {
    id: "memory-flip",
    title: "Memory Flip",
    description: "Match pairs and boost memory!",
    xp: 30,
    category: "Memory",
    difficulty: "easy",
    color: "green"
  },
  {
    id: "puzzle-portal",
    title: "Puzzle Portal",
    description: "Solve logic puzzles!",
    xp: 45,
    category: "Logic",
    difficulty: "medium",
    color: "purple"
  },
  {
    id: "grammar-builder",
    title: "Grammar Builder",
    description: "Build better sentences!",
    xp: 35,
    category: "Language",
    difficulty: "easy",
    color: "orange"
  },
  {
    id: "quiz-attack",
    title: "Quiz Attack",
    description: "Test your knowledge!",
    xp: 60,
    category: "General",
    difficulty: "medium",
    color: "red"
  },
  {
    id: "color-match",
    title: "Color Match",
    description: "Learn colors and patterns!",
    xp: 25,
    category: "Visual",
    difficulty: "easy",
    color: "yellow"
  },
  {
    id: "code-runner",
    title: "Code Runner",
    description: "Learn basic coding!",
    xp: 55,
    category: "STEM",
    difficulty: "hard",
    color: "indigo"
  },
  {
    id: "reaction-hero",
    title: "Reaction Hero",
    description: "Test your reflexes!",
    xp: 35,
    category: "Action",
    difficulty: "medium",
    color: "pink"
  },
  {
    id: "speed-sort",
    title: "Speed Sort",
    description: "Sort items by category!",
    xp: 40,
    category: "Logic",
    difficulty: "medium",
    color: "blue"
  },
  {
    id: "word-builder",
    title: "Word Builder",
    description: "Create words from letters!",
    xp: 45,
    category: "Language",
    difficulty: "medium",
    color: "green"
  },
  {
    id: "number-crunch",
    title: "Number Crunch",
    description: "Advanced math challenges!",
    xp: 65,
    category: "Math",
    difficulty: "hard",
    color: "red"
  },
  {
    id: "pattern-master",
    title: "Pattern Master",
    description: "Recognize and complete patterns!",
    xp: 50,
    category: "Logic",
    difficulty: "medium",
    color: "purple"
  },
  {
    id: "story-spinner",
    title: "Story Spinner",
    description: "Create amazing stories!",
    xp: 40,
    category: "Creative",
    difficulty: "easy",
    color: "pink"
  },
  {
    id: "science-quest",
    title: "Science Quest",
    description: "Explore the world of science!",
    xp: 55,
    category: "Science",
    difficulty: "medium",
    color: "indigo"
  },
  {
    id: "art-adventure",
    title: "Art Adventure",
    description: "Express your creativity!",
    xp: 35,
    category: "Art",
    difficulty: "easy",
    color: "yellow"
  }
];

export const getGamesByCategory = (category: string): Game[] => {
  return AVAILABLE_GAMES.filter(game => game.category === category);
};

export const getGameById = (id: string): Game | undefined => {
  return AVAILABLE_GAMES.find(game => game.id === id);
};

export const getGamesByDifficulty = (difficulty: Game['difficulty']): Game[] => {
  return AVAILABLE_GAMES.filter(game => game.difficulty === difficulty);
};

export const getAllCategories = (): string[] => {
  const categories = new Set(AVAILABLE_GAMES.map(game => game.category));
  return Array.from(categories).sort();
};
