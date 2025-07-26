import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PuzzlePiece {
  id: number;
  value: number;
  isEmpty: boolean;
}

export default function PuzzlePortal() {
  const [puzzle, setPuzzle] = useState<PuzzlePiece[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const endGameMutation = useMutation({
    mutationFn: async ({ score, xp }: { score: number; xp: number }) => {
      const response = await apiRequest("POST", "/api/games/puzzle-portal/play", { score, xpEarned: xp });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/progress"] });
    },
  });

  const initializeGame = () => {
    // Create a 3x3 sliding puzzle (0 represents empty space)
    const initialPuzzle = [
      { id: 0, value: 1, isEmpty: false },
      { id: 1, value: 2, isEmpty: false },
      { id: 2, value: 3, isEmpty: false },
      { id: 3, value: 4, isEmpty: false },
      { id: 4, value: 5, isEmpty: false },
      { id: 5, value: 6, isEmpty: false },
      { id: 6, value: 7, isEmpty: false },
      { id: 7, value: 8, isEmpty: false },
      { id: 8, value: 0, isEmpty: true },
    ];

    // Shuffle the puzzle
    const shuffled = [...initialPuzzle];
    for (let i = 0; i < 100; i++) {
      const emptyIndex = shuffled.findIndex(p => p.isEmpty);
      const possibleMoves = getPossibleMoves(emptyIndex);
      const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      if (randomMove !== undefined) {
        [shuffled[emptyIndex], shuffled[randomMove]] = [shuffled[randomMove], shuffled[emptyIndex]];
      }
    }

    setPuzzle(shuffled);
    setMoves(0);
    setGameActive(true);
    setGameComplete(false);
    setStartTime(new Date());
  };

  const getPossibleMoves = (emptyIndex: number) => {
    const moves = [];
    const row = Math.floor(emptyIndex / 3);
    const col = emptyIndex % 3;

    // Up
    if (row > 0) moves.push(emptyIndex - 3);
    // Down
    if (row < 2) moves.push(emptyIndex + 3);
    // Left
    if (col > 0) moves.push(emptyIndex - 1);
    // Right
    if (col < 2) moves.push(emptyIndex + 1);

    return moves;
  };

  const movePiece = (clickedIndex: number) => {
    if (!gameActive) return;

    const emptyIndex = puzzle.findIndex(p => p.isEmpty);
    const possibleMoves = getPossibleMoves(emptyIndex);

    if (possibleMoves.includes(clickedIndex)) {
      const newPuzzle = [...puzzle];
      [newPuzzle[emptyIndex], newPuzzle[clickedIndex]] = [newPuzzle[clickedIndex], newPuzzle[emptyIndex]];
      setPuzzle(newPuzzle);
      setMoves(moves + 1);

      // Check if puzzle is solved
      const isSolved = newPuzzle.every((piece, index) => {
        if (index === 8) return piece.isEmpty; // Last piece should be empty
        return piece.value === index + 1;
      });

      if (isSolved) {
        setGameComplete(true);
        setGameActive(false);
        
        const timeBonus = startTime ? Math.max(0, 300 - Math.floor((Date.now() - startTime.getTime()) / 1000)) : 0;
        const moveBonus = Math.max(0, 50 - moves);
        const finalScore = 100 + timeBonus + moveBonus;
        const xpEarned = Math.floor(finalScore / 20);

        endGameMutation.mutate({ score: finalScore, xp: xpEarned });

        toast({
          title: "Puzzle Solved! 🧩",
          description: `Completed in ${moves} moves! Score: ${finalScore}`,
        });
      }
    }
  };

  if (!gameActive && !gameComplete) {
    return (
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">🧩</div>
        <h2 className="font-fredoka text-2xl">Puzzle Portal</h2>
        <p className="text-gray-600">
          Slide the numbered tiles to arrange them in order from 1 to 8.
          Solve it quickly with fewer moves for a higher score!
        </p>
        <Button 
          onClick={initializeGame}
          className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold"
        >
          Start Puzzle! 🧩
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
            <div className="text-2xl font-bold text-purple-600">{moves}</div>
            <div className="text-sm text-gray-600">Moves</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">
              {startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000) : 0}s
            </div>
            <div className="text-sm text-gray-600">Time</div>
          </CardContent>
        </Card>
      </div>

      {/* Puzzle Grid */}
      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
        {puzzle.map((piece, index) => (
          <Card
            key={piece.id}
            className={`aspect-square cursor-pointer transition-all duration-200 ${
              piece.isEmpty 
                ? 'bg-gray-100 border-dashed border-gray-300' 
                : 'bg-white border-purple-300 hover:bg-purple-50 hover:scale-105'
            }`}
            onClick={() => movePiece(index)}
          >
            <CardContent className="flex items-center justify-center h-full p-2">
              <div className="text-2xl font-bold text-purple-600">
                {piece.isEmpty ? '' : piece.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Target Pattern */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-sm">Target Pattern</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-1 max-w-32 mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, ''].map((num, index) => (
              <div
                key={index}
                className="aspect-square bg-gray-100 border border-gray-300 flex items-center justify-center text-sm font-semibold"
              >
                {num}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {gameComplete && (
        <Card className="mt-6">
          <CardContent className="pt-6 text-center">
            <h3 className="font-semibold mb-2">Puzzle Complete! 🎉</h3>
            <p>Moves: {moves}</p>
            <p>Time: {startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000) : 0} seconds</p>
            <p>XP Earned: {Math.floor((100 + Math.max(0, 300 - Math.floor((Date.now() - (startTime?.getTime() || 0)) / 1000)) + Math.max(0, 50 - moves)) / 20)}</p>
            <Button 
              onClick={initializeGame}
              className="mt-4 bg-purple-500 hover:bg-purple-600 text-white"
            >
              Play Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
