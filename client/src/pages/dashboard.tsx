import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import AccessibilityToolbar from "@/components/accessibility-toolbar";
import SpinningWheel from "@/components/spinning-wheel";
import GameCard from "@/components/game-card";
import ProgressBar from "@/components/progress-bar";
import SurveyModal from "@/components/survey-modal";
import { AVAILABLE_GAMES } from "@/lib/games";
import { Star, Trophy, Flame, WandSparkles } from "lucide-react";
import type { User, UserProgress, DailySpins, UnlockedGame, Achievement } from "@shared/schema";

export default function Dashboard() {
  const [showSurvey, setShowSurvey] = useState(false);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user/current"],
  });

  const { data: progress } = useQuery<UserProgress>({
    queryKey: ["/api/user/progress"],
  });

  const { data: spins } = useQuery<DailySpins>({
    queryKey: ["/api/user/spins"],
  });

  const { data: unlockedGames } = useQuery<UnlockedGame[]>({
    queryKey: ["/api/user/games"],
  });

  const { data: achievements } = useQuery<Achievement[]>({
    queryKey: ["/api/user/achievements"],
  });

  const unlockedGameIds = unlockedGames?.map(game => game.gameId) || [];

  return (
    <div className="min-h-screen bg-white">
      <AccessibilityToolbar user={user} />
      
      {/* Main Navigation */}
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <WandSparkles className="text-white text-lg" />
              </div>
              <h1 className="font-bold text-2xl text-purple-700">MagiLearn</h1>
            </div>
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => setShowSurvey(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
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
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-4 right-4 text-6xl opacity-20">✨</div>
          <div className="absolute bottom-4 left-4 text-4xl opacity-20">🌟</div>
          
          <div className="relative z-10">
            <h2 className="font-fredoka text-3xl mb-2">
              Ready for magical learning, {user?.name || user?.username}?
            </h2>
            {user?.class && (
              <p className="text-lg opacity-90 mb-2">
                {user.class} • Learning Style: {user.learningStyle?.charAt(0).toUpperCase() + user.learningStyle?.slice(1) || 'Visual'}
              </p>
            )}
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

        {/* Personalized Learning Section */}
        {user?.currentMood && user?.subjects && (
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <h3 className="font-fredoka text-2xl text-gray-800 mb-6">Your Learning Journey Today</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Mood */}
              <div className="bg-gradient-to-r from-golden-yellow/10 to-orange-magic/10 rounded-xl p-6">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">🎭</span>
                  How You're Feeling
                </h4>
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">
                    {user.currentMood === 'happy' && '😊'}
                    {user.currentMood === 'excited' && '🤩'}
                    {user.currentMood === 'calm' && '😌'}
                    {user.currentMood === 'curious' && '🤔'}
                    {user.currentMood === 'tired' && '😴'}
                    {user.currentMood === 'neutral' && '😐'}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-800 capitalize">{user.currentMood}</p>
                    <p className="text-sm text-gray-600">
                      {user.currentMood === 'happy' && 'Perfect mood for learning!'}
                      {user.currentMood === 'excited' && 'Great energy for challenges!'}
                      {user.currentMood === 'calm' && 'Ideal for focused learning'}
                      {user.currentMood === 'curious' && 'Ready to explore new topics!'}
                      {user.currentMood === 'tired' && 'Let\'s take it easy today'}
                      {user.currentMood === 'neutral' && 'Ready for balanced learning'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Favorite Subjects */}
              <div className="bg-gradient-to-r from-magic-purple/10 to-pink-magic/10 rounded-xl p-6">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">📚</span>
                  Your Favorite Subjects
                </h4>
                <div className="flex flex-wrap gap-2">
                  {user.subjects?.map((subject) => (
                    <span 
                      key={subject}
                      className="px-3 py-1 bg-magic-purple/20 text-magic-purple rounded-full text-sm font-medium capitalize"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Games are personalized for your interests!
                </p>
              </div>
            </div>
          </div>
        )}

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
                label="English Skills" 
                value={progress?.englishSkills || 0} 
                color="green" 
              />
              <ProgressBar 
                label="Science Skills" 
                value={progress?.scienceSkills || 0} 
                color="purple" 
              />
              <ProgressBar 
                label="Coding Skills" 
                value={progress?.codingSkills || 0} 
                color="orange" 
              />
              <ProgressBar 
                label="Art Skills" 
                value={progress?.artSkills || 0} 
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
