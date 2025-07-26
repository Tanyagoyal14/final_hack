import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Lock } from "lucide-react";
import { useLocation } from "wouter";

interface Game {
  id: string;
  title: string;
  description: string;
  xp: number;
  category: string;
  difficulty: string;
  color: string;
}

interface GameCardProps {
  game: Game;
  isUnlocked: boolean;
}

export default function GameCard({ game, isUnlocked }: GameCardProps) {
  const [, setLocation] = useLocation();

  const handlePlayGame = () => {
    if (isUnlocked) {
      setLocation(`/game/${game.id}`);
    }
  };

  const getGradientClass = (color: string) => {
    const gradients = {
      blue: "from-blue-50 to-blue-100 border-blue-200",
      green: "from-green-50 to-green-100 border-green-200",
      purple: "from-purple-50 to-purple-100 border-purple-200",
      red: "from-red-50 to-red-100 border-red-200",
      yellow: "from-yellow-50 to-yellow-100 border-yellow-200",
      pink: "from-pink-50 to-pink-100 border-pink-200",
      indigo: "from-indigo-50 to-indigo-100 border-indigo-200",
      orange: "from-orange-50 to-orange-100 border-orange-200",
    };
    return gradients[color as keyof typeof gradients] || gradients.blue;
  };

  const getButtonClass = (color: string) => {
    const buttonColors = {
      blue: "bg-blue-500 hover:bg-blue-600",
      green: "bg-green-500 hover:bg-green-600",
      purple: "bg-purple-500 hover:bg-purple-600",
      red: "bg-red-500 hover:bg-red-600",
      yellow: "bg-yellow-500 hover:bg-yellow-600",
      pink: "bg-pink-500 hover:bg-pink-600",
      indigo: "bg-indigo-500 hover:bg-indigo-600",
      orange: "bg-orange-500 hover:bg-orange-600",
    };
    return buttonColors[color as keyof typeof buttonColors] || buttonColors.blue;
  };

  const getTextColor = (color: string) => {
    const textColors = {
      blue: "text-blue-800",
      green: "text-green-800",
      purple: "text-purple-800",
      red: "text-red-800",
      yellow: "text-yellow-800",
      pink: "text-pink-800",
      indigo: "text-indigo-800",
      orange: "text-orange-800",
    };
    return textColors[color as keyof typeof textColors] || textColors.blue;
  };

  if (!isUnlocked) {
    return (
      <Card className="bg-gray-100 rounded-2xl p-6 border-2 border-gray-200 relative opacity-75">
        <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <Lock className="h-8 w-8 text-gray-600 mb-2 mx-auto" />
            <p className="text-sm text-gray-600 font-medium">Spin to Unlock</p>
          </div>
        </div>
        <div className="w-full h-32 bg-gray-300 rounded-xl mb-4 flex items-center justify-center">
          <div className="text-gray-500 text-sm">Game Preview</div>
        </div>
        <h4 className="font-fredoka text-lg text-gray-600 mb-2">{game.title}</h4>
        <p className="text-sm text-gray-500 mb-3">{game.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">{game.xp} XP</span>
          </div>
          <Button
            disabled
            size="sm"
            className="bg-gray-400 text-white cursor-not-allowed"
          >
            Locked
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={`bg-gradient-to-br ${getGradientClass(game.color)} rounded-2xl p-6 border-2 game-card-hover cursor-pointer`}
      onClick={handlePlayGame}
    >
      <div className="w-full h-32 bg-white/50 rounded-xl mb-4 flex items-center justify-center">
        <div className={`${getTextColor(game.color)} text-sm font-medium`}>
          {game.title} Preview
        </div>
      </div>
      <h4 className={`font-fredoka text-lg ${getTextColor(game.color)} mb-2`}>
        {game.title}
      </h4>
      <p className={`text-sm ${getTextColor(game.color)}/80 mb-3`}>
        {game.description}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-golden-yellow" />
          <span className="text-sm text-gray-600">{game.xp} XP</span>
        </div>
        <Button
          size="sm"
          className={`${getButtonClass(game.color)} text-white transition-colors`}
        >
          Play Now
        </Button>
      </div>
    </Card>
  );
}
