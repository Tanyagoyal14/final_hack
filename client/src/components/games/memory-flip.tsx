import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MemoryCard {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryFlip() {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const endGameMutation = useMutation({
    mutationFn: async ({ score, xp }: { score: number; xp: number }) => {
      const response = await apiRequest("POST", "/api/games/memory-flip/play", { score, xpEarned: xp });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/progress"] });
    },
  });

  const emojis = ["🎮", "🎲", "🎯", "🎪", "🎨", "🎭", "🎺", "🎸"];

  const initializeGame = () => {
    const gameEmojis = [...emojis, ...emojis];
    const shuffled = gameEmojis.sort(() => Math.random() - 0.5);
    
    const newCards = shuffled.map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false,
    }));

    setCards(newCards);
    setFlippedCards([]);
    setScore(1000);
    setMoves(0);
    setGameActive(true);
    setGameComplete(false);
  };

  const flipCard = (cardId: number) => {
    if (!gameActive || flippedCards.length >= 2) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));
    
    setFlippedCards(prev => [...prev, cardId]);
  };

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards.find(c => c.id === first);
      const secondCard = cards.find(c => c.id === second);
      
      setMoves(moves + 1);

      setTimeout(() => {
        if (firstCard?.emoji === secondCard?.emoji) {
          // Match found
          setCards(prev => prev.map(c => 
            c.id === first || c.id === second 
              ? { ...c, isMatched: true } 
              : c
          ));
          toast({
            title: "Match Found! ⭐",
            description: "Great memory!",
          });
        } else {
          // No match
          setCards(prev => prev.map(c => 
            c.id === first || c.id === second 
              ? { ...c, isFlipped: false } 
              : c
          ));
          setScore(Math.max(0, score - 50));
        }
        setFlippedCards([]);
      }, 1000);
    }
  }, [flippedCards, cards, moves, score]);

  useEffect(() => {
    if (gameActive && cards.length > 0 && cards.every(card => card.isMatched)) {
      setGameComplete(true);
      setGameActive(false);
      const finalScore = Math.max(score, 100);
      const xpEarned = Math.floor(finalScore / 50);
      
      endGameMutation.mutate({ score: finalScore, xp: xpEarned });
      
      toast({
        title: "Memory Flip Complete! 🧠",
        description: `You found all matches in ${moves} moves! Score: ${finalScore}`,
      });
    }
  }, [cards, gameActive, score, moves]);

  if (!gameActive && !gameComplete) {
    return (
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">🧠</div>
        <h2 className="font-fredoka text-2xl">Memory Flip</h2>
        <p className="text-gray-600">
          Flip cards to find matching pairs! Remember where you saw each emoji.
          Fewer moves = higher score!
        </p>
        <Button 
          onClick={initializeGame}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-semibold"
        >
          Start Game! 🧠
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Game Stats */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{score}</div>
            <div className="text-sm text-gray-600">Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-600">{moves}</div>
            <div className="text-sm text-gray-600">Moves</div>
          </CardContent>
        </Card>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-4 gap-3">
        {cards.map((card) => (
          <Card
            key={card.id}
            className={`aspect-square cursor-pointer transition-all duration-300 hover:scale-105 ${
              card.isMatched ? 'bg-green-100 border-green-300' : 
              card.isFlipped ? 'bg-blue-100 border-blue-300' : 
              'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => flipCard(card.id)}
          >
            <CardContent className="flex items-center justify-center h-full p-2">
              <div className="text-3xl">
                {card.isFlipped || card.isMatched ? card.emoji : "❓"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {gameComplete && (
        <Card className="mt-6">
          <CardContent className="pt-6 text-center">
            <h3 className="font-semibold mb-2">Game Complete! 🎉</h3>
            <p>Final Score: {score} points</p>
            <p>Moves: {moves}</p>
            <p>XP Earned: {Math.floor(score / 50)}</p>
            <Button 
              onClick={initializeGame}
              className="mt-4 bg-green-500 hover:bg-green-600 text-white"
            >
              Play Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
