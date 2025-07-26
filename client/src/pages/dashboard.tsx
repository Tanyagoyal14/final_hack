import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import AccessibilityToolbar from "@/components/accessibility-toolbar";
import SpinningWheel from "@/components/spinning-wheel";
import GameCard from "@/components/game-card";
import ProgressBar from "@/components/progress-bar";
import SurveyModal from "@/components/survey-modal";
import { AVAILABLE_GAMES } from "@/lib/games";
import { Star, Trophy, Flame, WandSparkles } from "lucide-react";

export default function Dashboard() {
  const [showSurvey, setShowSurvey] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["/api/user/current"],
  });

  const { data: progress } = useQuery({
    queryKey: ["/api/user/progress"],
  });

  const { data: spins } = useQuery({
    queryKey: ["/api/user/spins"],
  });

  const { data: unlockedGames } = useQuery({
    queryKey: ["/api/user/games"],
  });

  const { data: achievements } = useQuery({
    queryKey: ["/api/user/achievements"],
  });

  const unlockedGameIds = unlockedGames?.map(game => game.gameId) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <AccessibilityToolbar user={user} />
      
      {/* Main Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-magic-purple to-pink-magic rounded-full flex items-center justify-center">
                <WandSparkles className="text-white text-lg" />
              </div>
              <h1 className="font-fredoka text-2xl text-magic-purple">MagiLearn</h1>
            </div>
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => setShowSurvey(true)}
                className="bg-magic-purple text-white px-4 py-2 rounded-lg hover:bg-light-purple transition-colors font-medium"
              >
                Update Survey
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section with Daily Stats */}
        <div className="bg-gradient-to-r from-magic-purple to-pink-magic rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-4 right-4 text-6xl opacity-20">✨</div>
          <div className="absolute bottom-4 left-4 text-4xl opacity-20">🌟</div>
          
          <div className="relative z-10">
            <h2 className="font-fredoka text-3xl mb-2">Ready for WandSparkles Learning?</h2>
            <p className="text-xl opacity-90 mb-6">
              You have <span className="font-bold">{spins?.spinsRemaining || 0} spins</span> left today!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <Star className="text-2xl text-golden-yellow" />
                  <div>
                    <p className="text-lg font-semibold">{progress?.totalXp || 0} XP</p>
                    <p className="text-sm opacity-80">Total Experience</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <Trophy className="text-2xl text-golden-yellow" />
                  <div>
                    <p className="text-lg font-semibold">{achievements?.length || 0} Badges</p>
                    <p className="text-sm opacity-80">Achievements</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <Flame className="text-2xl text-golden-yellow" />
                  <div>
                    <p className="text-lg font-semibold">{progress?.learningStreak || 0} Days</p>
                    <p className="text-sm opacity-80">Learning Streak</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spinning Wheel Section */}
        <SpinningWheel spinsRemaining={spins?.spinsRemaining || 0} />

        {/* Educational Games Library */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-fredoka text-2xl text-gray-800">Your Learning Games</h3>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-magic-purple text-white rounded-lg font-medium">All Games</button>
              <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">Math</button>
              <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">Language</button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {AVAILABLE_GAMES.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                isUnlocked={unlockedGameIds.includes(game.id)}
              />
            ))}
          </div>
        </div>

        {/* Progress Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Learning Progress */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h3 className="font-fredoka text-2xl text-gray-800 mb-6">Learning Progress</h3>
            
            <div className="space-y-6">
              <ProgressBar 
                label="Math Skills" 
                value={progress?.mathSkills || 0} 
                color="blue" 
              />
              <ProgressBar 
                label="Language Arts" 
                value={progress?.languageSkills || 0} 
                color="green" 
              />
              <ProgressBar 
                label="Problem Solving" 
                value={progress?.problemSolving || 0} 
                color="purple" 
              />
              <ProgressBar 
                label="Memory Skills" 
                value={progress?.memorySkills || 0} 
                color="pink" 
              />
            </div>
          </div>
          
          {/* Recent Achievements */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h3 className="font-fredoka text-2xl text-gray-800 mb-6">Recent Achievements</h3>
            
            <div className="space-y-4">
              {achievements?.slice(0, 3).map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-golden-yellow/10 to-golden-yellow/20 rounded-xl">
                  <div className="w-12 h-12 bg-golden-yellow rounded-full flex items-center justify-center">
                    <Trophy className="text-white text-lg" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{achievement.title}</h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Survey Modal */}
      <SurveyModal isOpen={showSurvey} onClose={() => setShowSurvey(false)} />
    </div>
  );
}
