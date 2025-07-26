import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SpinningWheelProps {
  spinsRemaining: number;
}

export default function SpinningWheel({ spinsRemaining }: SpinningWheelProps) {
  const [rotation, setRotation] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const spinMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/user/spin");
      return response.json();
    },
    onSuccess: (data) => {
      // Animate wheel
      const randomRotation = Math.floor(Math.random() * 1080) + 720;
      setRotation(prev => prev + randomRotation);
      
      // Show reward toast
      setTimeout(() => {
        if (data.reward.type === "game") {
          toast({
            title: "New Game Unlocked! 🎉",
            description: `You unlocked ${data.reward.gameId?.replace('-', ' ')} and earned ${data.reward.xp} XP!`,
          });
        } else {
          toast({
            title: "XP Earned! ⭐",
            description: `You earned ${data.reward.xp} XP!`,
          });
        }
      }, 3000);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user/spins"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/games"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/progress"] });
    },
    onError: () => {
      toast({
        title: "Spin Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSpin = () => {
    if (spinsRemaining > 0 && !spinMutation.isPending) {
      spinMutation.mutate();
    }
  };

  return (
    <Card className="bg-white rounded-3xl shadow-xl p-8 mb-8">
      <div className="text-center mb-6">
        <h3 className="font-fredoka text-2xl text-gray-800 mb-2">Daily Reward Wheel</h3>
        <p className="text-gray-600">Spin to unlock educational games and earn rewards!</p>
      </div>
      
      <div className="flex flex-col lg:flex-row items-center justify-center space-y-6 lg:space-y-0 lg:space-x-12">
        {/* Spinning Wheel */}
        <div className="relative">
          <div 
            className="w-64 h-64 rounded-full border-8 border-magic-purple relative overflow-hidden wheel-spin"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {/* Wheel segments */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500" style={{clipPath: "polygon(50% 50%, 50% 0%, 100% 0%, 50% 50%)"}}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500" style={{clipPath: "polygon(50% 50%, 100% 0%, 100% 50%, 50% 50%)"}}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500" style={{clipPath: "polygon(50% 50%, 100% 50%, 100% 100%, 50% 50%)"}}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500" style={{clipPath: "polygon(50% 50%, 100% 100%, 50% 100%, 50% 50%)"}}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-500" style={{clipPath: "polygon(50% 50%, 50% 100%, 0% 100%, 50% 50%)"}}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-pink-500" style={{clipPath: "polygon(50% 50%, 0% 100%, 0% 50%, 50% 50%)"}}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-indigo-500" style={{clipPath: "polygon(50% 50%, 0% 50%, 0% 0%, 50% 50%)"}}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500" style={{clipPath: "polygon(50% 50%, 0% 0%, 50% 0%, 50% 50%)"}}></div>
            
            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
              <i className="fas fa-magic text-magic-purple text-xl"></i>
            </div>
          </div>
          
          {/* Wheel pointer */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
            <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-magic-purple"></div>
          </div>
        </div>
        
        {/* Spin Controls */}
        <div className="text-center">
          <Button
            onClick={handleSpin}
            disabled={spinsRemaining <= 0 || spinMutation.isPending}
            className="bg-gradient-to-r from-magic-purple to-pink-magic text-white px-8 py-4 rounded-2xl font-fredoka text-xl hover:scale-105 transform transition-all duration-200 shadow-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {spinMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                SPINNING...
              </>
            ) : spinsRemaining > 0 ? (
              <>
                <Play className="mr-2 h-5 w-5" />
                SPIN NOW!
              </>
            ) : (
              <>
                <Clock className="mr-2 h-5 w-5" />
                No Spins Left
              </>
            )}
          </Button>
          <p className="text-gray-600 mb-4">{spinsRemaining} spins remaining today</p>
          <Card className="bg-gray-100 p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Today's Rewards</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Math Ninja</span>
                <i className="fas fa-check text-success-green"></i>
              </div>
              <div className="flex items-center justify-between">
                <span>50 XP Bonus</span>
                <i className="fas fa-check text-success-green"></i>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Card>
  );
}
