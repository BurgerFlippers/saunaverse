import { Card } from './ui/card';

const badges = [
  {
    id: 1,
    emoji: '🔥',
    name: '2-Week Streak',
    description: 'Sauna for 14 days straight',
    earned: true,
    date: 'Nov 14, 2025'
  },
  {
    id: 2,
    emoji: '⭐',
    name: 'First Session',
    description: 'Complete your first sauna',
    earned: true,
    date: 'Oct 15, 2025'
  },
  {
    id: 3,
    emoji: '🏆',
    name: 'Heat Master',
    description: 'Reach 100°C in a session',
    earned: true,
    date: 'Nov 1, 2025'
  },
  {
    id: 4,
    emoji: '💪',
    name: 'Endurance Pro',
    description: 'Complete a 60-minute session',
    earned: true,
    date: 'Nov 8, 2025'
  },
  {
    id: 5,
    emoji: '🌟',
    name: '1-Month Streak',
    description: 'Sauna for 30 days straight',
    earned: false,
    progress: 14
  },
  {
    id: 6,
    emoji: '🎯',
    name: '100 Sessions',
    description: 'Complete 100 sauna sessions',
    earned: false,
    progress: 47
  },
  {
    id: 7,
    emoji: '🌊',
    name: 'Ice Plunger',
    description: 'Log a cold plunge after sauna',
    earned: false
  },
  {
    id: 8,
    emoji: '👑',
    name: 'Sauna King',
    description: 'Reach 1000 total sessions',
    earned: false,
    progress: 47
  }
];

export function Badges() {
  const earnedBadges = badges.filter(b => b.earned);
  const lockedBadges = badges.filter(b => !b.earned);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900">Earned Badges</h2>
          <span className="text-sm text-gray-500">{earnedBadges.length} / {badges.length}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {earnedBadges.map((badge) => (
            <Card key={badge.id} className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <div className="text-center">
                <div className="text-5xl mb-2">{badge.emoji}</div>
                <p className="text-sm text-gray-900 mb-1">{badge.name}</p>
                <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
                <p className="text-xs text-orange-600">Earned {badge.date}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-gray-900 mb-4">Locked Badges</h2>
        
        <div className="grid grid-cols-2 gap-4">
          {lockedBadges.map((badge) => (
            <Card key={badge.id} className="p-4 bg-gray-50 border-gray-200 opacity-75">
              <div className="text-center">
                <div className="text-5xl mb-2 grayscale opacity-50">{badge.emoji}</div>
                <p className="text-sm text-gray-700 mb-1">{badge.name}</p>
                <p className="text-xs text-gray-500 mb-2">{badge.description}</p>
                {badge.progress && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all"
                        style={{ width: `${(badge.progress / (badge.name.includes('Month') ? 30 : 100)) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{badge.progress} / {badge.name.includes('Month') ? 30 : 100}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
