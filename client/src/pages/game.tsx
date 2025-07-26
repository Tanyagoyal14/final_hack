import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { AVAILABLE_GAMES } from "@/lib/games";
import MathNinja from "@/components/games/math-ninja";
import MemoryFlip from "@/components/games/memory-flip";
import PuzzlePortal from "@/components/games/puzzle-portal";
import QuizAttack from "@/components/games/quiz-attack";
import ColorMatch from "@/components/games/color-match";

const GAME_COMPONENTS = {
  "math-ninja": MathNinja,
  "memory-flip": MemoryFlip,
  "puzzle-portal": PuzzlePortal,
  "quiz-attack": QuizAttack,
  "color-match": ColorMatch,
} as const;

export default function Game() {
  const { gameId } = useParams();
  const [, setLocation] = useLocation();
  
  const game = AVAILABLE_GAMES.find(g => g.id === gameId);
  const GameComponent = gameId ? GAME_COMPONENTS[gameId as keyof typeof GAME_COMPONENTS] : null;

  if (!game || !GameComponent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Game Not Found</h1>
            <p className="text-gray-600 mb-4">The requested game could not be found.</p>
            <Button onClick={() => setLocation("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setLocation("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="font-fredoka text-3xl text-gray-800">{game.title}</h1>
          <p className="text-gray-600">{game.description}</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="font-fredoka text-xl">{game.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <GameComponent />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
