import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function MathNinja() {
  const [currentProblem, setCurrentProblem] = useState({ a: 0, b: 0, operator: "+" });
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(false);
  const [streak, setStreak] = useState(0);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const endGameMutation = useMutation({
    mutationFn: async ({ score, xp }: { score: number; xp: number }) => {
      const response = await apiRequest("POST", "/api/games/math-ninja/play", { score, xpEarned: xp });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/progress"] });
    },
  });

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameActive) {
      endGame();
    }
  }, [timeLeft, gameActive]);

  const generateProblem = () => {
    const operators = ["+", "-", "*"];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let a, b;
    
    switch (operator) {
      case "+":
        a = Math.floor(Math.random() * 50) + 1;
        b = Math.floor(Math.random() * 50) + 1;
        break;
      case "-":
        a = Math.floor(Math.random() * 50) + 25;
        b = Math.floor(Math.random() * a) + 1;
        break;
      case "*":
        a = Math.floor(Math.random() * 12) + 1;
        b = Math.floor(Math.random() * 12) + 1;
        break;
      default:
        a = 1;
        b = 1;
    }
    
    setCurrentProblem({ a, b, operator });
  };

  const getCorrectAnswer = () => {
    const { a, b, operator } = currentProblem;
    switch (operator) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      default: return 0;
    }
  };

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setTimeLeft(60);
    setStreak(0);
    generateProblem();
  };

  const endGame = () => {
    setGameActive(false);
    const xpEarned = Math.floor(score / 10) * 5; // 5 XP per 10 points
    endGameMutation.mutate({ score, xp: xpEarned });
    
    toast({
      title: "Math Ninja Complete! 🥷",
      description: `Final Score: ${score} points. You earned ${xpEarned} XP!`,
    });
  };

  const submitAnswer = () => {
    const correct = getCorrectAnswer();
    const answer = parseInt(userAnswer);
    
    if (answer === correct) {
      const points = (streak + 1) * 10;
      setScore(score + points);
      setStreak(streak + 1);
      toast({
        title: "Correct! ⭐",
        description: `+${points} points! Streak: ${streak + 1}`,
      });
    } else {
      setStreak(0);
      toast({
        title: "Incorrect ❌",
        description: `The answer was ${correct}. Keep trying!`,
        variant: "destructive",
      });
    }
    
    setUserAnswer("");
    generateProblem();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && gameActive && userAnswer) {
      submitAnswer();
    }
  };

  if (!gameActive) {
    return (
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">🥷</div>
        <h2 className="font-fredoka text-2xl">Math Ninja</h2>
        <p className="text-gray-600">
          Solve as many math problems as you can in 60 seconds! 
          Build streaks for bonus points!
        </p>
        <Button 
          onClick={startGame}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold"
        >
          Start Training! 🥷
        </Button>
        {score > 0 && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Last Game Results</h3>
              <p>Score: {score} points</p>
              <p>XP Earned: {Math.floor(score / 10) * 5}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Game Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{score}</div>
            <div className="text-sm text-gray-600">Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{timeLeft}</div>
            <div className="text-sm text-gray-600">Time Left</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-600">{streak}</div>
            <div className="text-sm text-gray-600">Streak</div>
          </CardContent>
        </Card>
      </div>

      {/* Math Problem */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">
            {currentProblem.a} {currentProblem.operator} {currentProblem.b} = ?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Your answer..."
              className="text-center text-xl"
              autoFocus
            />
            <Button 
              onClick={submitAnswer}
              disabled={!userAnswer}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8"
            >
              Submit
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button 
          onClick={endGame}
          variant="outline"
          className="text-red-600 border-red-600 hover:bg-red-50"
        >
          End Game
        </Button>
      </div>
    </div>
  );
}
