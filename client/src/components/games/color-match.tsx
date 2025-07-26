import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ColorChallenge {
  name: string;
  color: string;
  options: string[];
  correct: number;
}

export default function ColorMatch() {
  const colors = [
    { name: "Red", color: "#EF4444" },
    { name: "Blue", color: "#3B82F6" },
    { name: "Green", color: "#10B981" },
    { name: "Yellow", color: "#F59E0B" },
    { name: "Purple", color: "#8B5CF6" },
    { name: "Orange", color: "#F97316" },
    { name: "Pink", color: "#EC4899" },
    { name: "Cyan", color: "#06B6D4" },
    { name: "Lime", color: "#84CC16" },
    { name: "Indigo", color: "#6366F1" },
  ];

  const [currentChallenge, setCurrentChallenge] = useState<ColorChallenge | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const endGameMutation = useMutation({
    mutationFn: async ({ score, xp }: { score: number; xp: number }) => {
      const response = await apiRequest("POST", "/api/games/color-match/play", { score, xpEarned: xp });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/progress"] });
    },
  });

  const generateChallenge = () => {
    const target = colors[Math.floor(Math.random() * colors.length)];
    const wrongOptions = colors.filter(c => c.name !== target.name);
    const shuffledWrong = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 3);
    
    const allOptions = [target, ...shuffledWrong].sort(() => Math.random() - 0.5);
    const correctIndex = allOptions.findIndex(option => option.name === target.name);

    setCurrentChallenge({
      name: target.name,
      color: target.color,
      options: allOptions.map(option => option.name),
      correct: correctIndex,
    });
  };

  const startGame = () => {
    setScore(0);
    setRound(0);
    setGameActive(true);
    setGameComplete(false);
    setSelectedAnswer(null);
    setShowResult(false);
    generateChallenge();
  };

  const selectAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null || !currentChallenge) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const isCorrect = answerIndex === currentChallenge.correct;
    if (isCorrect) {
      setScore(score + 10);
      toast({
        title: "Correct! 🎨",
        description: "+10 points! Great color knowledge!",
      });
    } else {
      toast({
        title: "Incorrect ❌",
        description: `The correct answer was: ${currentChallenge.options[currentChallenge.correct]}`,
        variant: "destructive",
      });
    }
  };

  const nextRound = () => {
    if (round < 9) {
      setRound(round + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      generateChallenge();
    } else {
      setGameComplete(true);
      setGameActive(false);
      
      const xpEarned = Math.floor(score / 5) * 2;
      endGameMutation.mutate({ score, xp: xpEarned });
      
      toast({
        title: "Color Match Complete! 🌈",
        description: `Final Score: ${score}/100 points. You earned ${xpEarned} XP!`,
      });
    }
  };

  if (!gameActive && !gameComplete) {
    return (
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">🎨</div>
        <h2 className="font-fredoka text-2xl">Color Match</h2>
        <p className="text-gray-600">
          Look at the color and choose the correct name from the options.
          Test your color recognition skills across 10 rounds!
        </p>
        <Button 
          onClick={startGame}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-xl font-semibold"
        >
          Start Game! 🎨
        </Button>
      </div>
    );
  }

  if (gameComplete) {
    return (
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="font-fredoka text-2xl">Color Match Complete!</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-lg">Final Score: <span className="font-bold text-yellow-600">{score}/100</span></p>
              <p>Correct Answers: {score / 10}/10</p>
              <p>Accuracy: {score}%</p>
              <p>XP Earned: {Math.floor(score / 5) * 2}</p>
            </div>
          </CardContent>
        </Card>
        <Button 
          onClick={startGame}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-xl font-semibold"
        >
          Play Again! 🎨
        </Button>
      </div>
    );
  }

  if (!currentChallenge) return null;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
          style={{ width: `${((round + 1) / 10) * 100}%` }}
        ></div>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">{score}</div>
            <div className="text-sm text-gray-600">Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{round + 1}</div>
            <div className="text-sm text-gray-600">Round</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-600">10</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Color Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">What color is this?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-6">
            <div 
              className="w-32 h-32 rounded-2xl border-4 border-gray-300 shadow-lg"
              style={{ backgroundColor: currentChallenge.color }}
            ></div>
          </div>

          <div className="space-y-3">
            {currentChallenge.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => selectAnswer(index)}
                disabled={selectedAnswer !== null}
                className={`w-full p-4 h-auto text-center justify-center transition-all duration-200 ${
                  selectedAnswer === null 
                    ? 'bg-white border-2 border-gray-200 text-gray-800 hover:border-yellow-300 hover:bg-yellow-50'
                    : selectedAnswer === index
                      ? index === currentChallenge.correct
                        ? 'bg-green-100 border-green-500 text-green-800'
                        : 'bg-red-100 border-red-500 text-red-800'
                      : index === currentChallenge.correct
                        ? 'bg-green-100 border-green-500 text-green-800'
                        : 'bg-gray-100 border-gray-300 text-gray-600'
                }`}
                variant="outline"
              >
                {option}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {showResult && (
        <div className="text-center">
          <Button 
            onClick={nextRound}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-xl font-semibold"
          >
            {round < 9 ? 'Next Color' : 'Finish Game'}
          </Button>
        </div>
      )}
    </div>
  );
}
