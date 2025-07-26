import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Question {
  question: string;
  options: string[];
  correct: number;
  category: string;
}

export default function QuizAttack() {
  const [questions] = useState<Question[]>([
    {
      question: "What is 7 × 8?",
      options: ["54", "56", "58", "62"],
      correct: 1,
      category: "Math"
    },
    {
      question: "Which planet is closest to the Sun?",
      options: ["Venus", "Mercury", "Earth", "Mars"],
      correct: 1,
      category: "Science"
    },
    {
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correct: 2,
      category: "Geography"
    },
    {
      question: "How many sides does a triangle have?",
      options: ["2", "3", "4", "5"],
      correct: 1,
      category: "Math"
    },
    {
      question: "What color do you get when you mix red and yellow?",
      options: ["Purple", "Orange", "Green", "Blue"],
      correct: 1,
      category: "Art"
    },
    {
      question: "Which animal is known as the 'King of the Jungle'?",
      options: ["Tiger", "Elephant", "Lion", "Gorilla"],
      correct: 2,
      category: "Animals"
    },
    {
      question: "What is 15 ÷ 3?",
      options: ["3", "4", "5", "6"],
      correct: 2,
      category: "Math"
    },
    {
      question: "How many days are in a week?",
      options: ["5", "6", "7", "8"],
      correct: 2,
      category: "General"
    }
  ]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const endGameMutation = useMutation({
    mutationFn: async ({ score, xp }: { score: number; xp: number }) => {
      const response = await apiRequest("POST", "/api/games/quiz-attack/play", { score, xpEarned: xp });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/progress"] });
    },
  });

  const startGame = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, 5);
    setShuffledQuestions(shuffled);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setGameActive(true);
    setGameComplete(false);
    setShowResult(false);
  };

  const selectAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const isCorrect = answerIndex === shuffledQuestions[currentQuestion].correct;
    if (isCorrect) {
      setScore(score + 20);
      toast({
        title: "Correct! ⭐",
        description: "+20 points!",
      });
    } else {
      toast({
        title: "Incorrect ❌",
        description: `The correct answer was: ${shuffledQuestions[currentQuestion].options[shuffledQuestions[currentQuestion].correct]}`,
        variant: "destructive",
      });
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < shuffledQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setGameComplete(true);
      setGameActive(false);
      
      const xpEarned = Math.floor(score / 10) * 3;
      endGameMutation.mutate({ score, xp: xpEarned });
      
      toast({
        title: "Quiz Complete! 🎯",
        description: `Final Score: ${score}/${shuffledQuestions.length * 20} points. You earned ${xpEarned} XP!`,
      });
    }
  };

  if (!gameActive && !gameComplete) {
    return (
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="font-fredoka text-2xl">Quiz Attack</h2>
        <p className="text-gray-600">
          Test your knowledge across different subjects! 
          Answer 5 random questions and earn points for each correct answer.
        </p>
        <Button 
          onClick={startGame}
          className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-semibold"
        >
          Start Quiz! 🎯
        </Button>
      </div>
    );
  }

  if (gameComplete) {
    return (
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="font-fredoka text-2xl">Quiz Complete!</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-lg">Final Score: <span className="font-bold text-red-600">{score}/{shuffledQuestions.length * 20}</span></p>
              <p>Correct Answers: {score / 20}/{shuffledQuestions.length}</p>
              <p>Accuracy: {Math.round((score / 20) / shuffledQuestions.length * 100)}%</p>
              <p>XP Earned: {Math.floor(score / 10) * 3}</p>
            </div>
          </CardContent>
        </Card>
        <Button 
          onClick={startGame}
          className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-semibold"
        >
          Play Again! 🎯
        </Button>
      </div>
    );
  }

  const question = shuffledQuestions[currentQuestion];

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className="bg-red-500 h-3 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestion + 1) / shuffledQuestions.length) * 100}%` }}
        ></div>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{score}</div>
            <div className="text-sm text-gray-600">Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{currentQuestion + 1}</div>
            <div className="text-sm text-gray-600">Question</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-600">{shuffledQuestions.length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2">{question.category}</div>
            <CardTitle className="text-xl">{question.question}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => selectAnswer(index)}
                disabled={selectedAnswer !== null}
                className={`w-full p-4 h-auto text-left justify-start transition-all duration-200 ${
                  selectedAnswer === null 
                    ? 'bg-white border-2 border-gray-200 text-gray-800 hover:border-red-300 hover:bg-red-50'
                    : selectedAnswer === index
                      ? index === question.correct
                        ? 'bg-green-100 border-green-500 text-green-800'
                        : 'bg-red-100 border-red-500 text-red-800'
                      : index === question.correct
                        ? 'bg-green-100 border-green-500 text-green-800'
                        : 'bg-gray-100 border-gray-300 text-gray-600'
                }`}
                variant="outline"
              >
                <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                {option}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {showResult && (
        <div className="text-center">
          <Button 
            onClick={nextQuestion}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-semibold"
          >
            {currentQuestion < shuffledQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </Button>
        </div>
      )}
    </div>
  );
}
