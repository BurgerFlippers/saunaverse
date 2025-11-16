import { Flame, Droplets, Timer, Calendar } from 'lucide-react';
import { Card } from './ui/card';
import { SessionChart } from './SessionChart';

export function Dashboard() {
  const stats = {
    currentStreak: 14,
    totalSessions: 47,
    avgTemp: 85,
    avgDuration: 25,
    thisWeek: 5
  };

  return (
    <div className="space-y-6">
      {/* Current Streak Banner */}
      <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 border-0">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-3">
            <Flame className="w-8 h-8" />
          </div>
          <div className="text-4xl mb-1">{stats.currentStreak} days</div>
          <p className="text-orange-100">Current Streak 🔥</p>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <div className="text-2xl">{stats.thisWeek}</div>
              <p className="text-gray-500 text-sm">This week</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Flame className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <div className="text-2xl">{stats.avgTemp}°C</div>
              <p className="text-gray-500 text-sm">Avg temp</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Droplets className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl">{stats.totalSessions}</div>
              <p className="text-gray-500 text-sm">Total sessions</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Timer className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <div className="text-2xl">{stats.avgDuration}min</div>
              <p className="text-gray-500 text-sm">Avg time</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Session Chart */}
      <Card className="p-4">
        <h3 className="mb-4">Last Session</h3>
        <SessionChart />
      </Card>

      {/* Recent Achievement */}
      <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <div className="flex items-center gap-4">
          <div className="text-4xl">🏆</div>
          <div>
            <p className="text-sm text-gray-500">New Badge Unlocked!</p>
            <p className="text-orange-600">2-Week Streak Master</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
