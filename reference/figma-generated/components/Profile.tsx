import { Card } from './ui/card';
import { Flame, Trophy, Clock, TrendingUp, CheckCircle2, Circle, Settings } from 'lucide-react';
import { mockUserStats, mockSessions } from '../data/mockData';
import { SessionCard } from './SessionCard';

export function Profile() {
  // Weekly streak data (Mon-Sun)
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weeklyProgress = [true, true, false, true, true, false, false]; // true = sauna session completed

  // Filter sessions to only show John Saunerson's posts
  const myPosts = mockSessions.filter(session => session.userName === 'John Saunerson');

  return (
    <div className="space-y-2">
      {/* User Header */}
      <Card className="p-6 bg-[#1F1F23] border-[#2C2B36] rounded-2xl heat-wave relative">
        {/* Settings Icon */}
        <button className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
          <Settings className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black text-2xl font-bold">
            J
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">John Saunerson</h2>
            <p className="text-sm text-gray-300 font-normal">Joined 3 months ago</p>
          </div>
        </div>

        {/* Weekly Streak */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-[#D01400]" />
            <h3 className="font-bold text-white" style={{ fontSize: '16px' }}>Weekly Streak</h3>
          </div>
          <div className="flex justify-between gap-2">
            {weekDays.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className={`w-full aspect-square rounded-xl flex items-center justify-center ${
                    weeklyProgress[index] 
                      ? 'bg-[#D01400]' 
                      : 'bg-[#1F1F23] border-2 border-[#2C2B36]'
                  }`}
                >
                  {weeklyProgress[index] ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <span className="text-xs text-gray-400 font-normal">{day}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 font-normal mt-3 text-center">
            {weeklyProgress.filter(d => d).length} of 7 days completed this week
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#2C2B36] p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-[#D01400]" />
              <p className="text-xs text-gray-300 font-normal">Current Streak</p>
            </div>
            <p className="text-3xl font-bold text-white">{mockUserStats.currentStreak}</p>
            <p className="text-xs text-gray-400 font-normal">days</p>
          </div>
          
          <div className="bg-[#2C2B36] p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-[#FFC533]" />
              <p className="text-xs text-gray-300 font-normal">Total Sessions</p>
            </div>
            <p className="text-3xl font-bold text-white">{mockUserStats.totalSessions}</p>
            <p className="text-xs text-gray-400 font-normal">sessions</p>
          </div>
          
          <div className="bg-[#2C2B36] p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-[#FF7A28]" />
              <p className="text-xs text-gray-300 font-normal">Total Time</p>
            </div>
            <p className="text-3xl font-bold text-white">{Math.floor(mockUserStats.totalMinutes / 60)}</p>
            <p className="text-xs text-gray-400 font-normal">hours</p>
          </div>
          
          <div className="bg-[#2C2B36] p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-[#D01400]" />
              <p className="text-xs text-gray-300 font-normal">Max Temp</p>
            </div>
            <p className="text-3xl font-bold text-white">{mockUserStats.maxTemp}</p>
            <p className="text-xs text-gray-400 font-normal">°C</p>
          </div>
        </div>
      </Card>

      {/* Sessions */}
      <Card className="p-5 bg-[#1F1F23] border-[#2C2B36] rounded-2xl heat-wave">
        <h3 className="text-xl font-bold text-white mb-4">My Posts</h3>
        <div className="space-y-3">
          {myPosts.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      </Card>
    </div>
  );
}