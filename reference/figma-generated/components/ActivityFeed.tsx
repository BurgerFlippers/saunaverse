import { Flame, Droplets, Timer, Heart, MessageCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';

const activities = [
  {
    id: 1,
    user: 'You',
    initials: 'ME',
    time: '2 hours ago',
    duration: 30,
    temp: 90,
    humidity: 65,
    location: 'Helsinki Sauna',
    likes: 12,
    comments: 3
  },
  {
    id: 2,
    user: 'Mika Virtanen',
    initials: 'MV',
    time: '5 hours ago',
    duration: 45,
    temp: 95,
    humidity: 70,
    location: 'Traditional Finnish Sauna',
    likes: 24,
    comments: 7
  },
  {
    id: 3,
    user: 'Anna Korhonen',
    initials: 'AK',
    time: '1 day ago',
    duration: 25,
    temp: 85,
    humidity: 60,
    location: 'Seaside Sauna',
    likes: 18,
    comments: 5
  },
  {
    id: 4,
    user: 'Pekka Salo',
    initials: 'PS',
    time: '1 day ago',
    duration: 35,
    temp: 88,
    humidity: 55,
    location: 'Lakeside Retreat',
    likes: 15,
    comments: 2
  }
];

export function ActivityFeed() {
  return (
    <div className="space-y-4">
      <h2 className="text-gray-900">Community Activity</h2>
      
      {activities.map((activity) => (
        <Card key={activity.id} className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <Avatar>
              <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                {activity.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-gray-900">{activity.user}</p>
              <p className="text-gray-500 text-sm">{activity.time}</p>
            </div>
          </div>

          <div className="mb-3">
            <p className="text-gray-700 mb-2">🧖 Sauna session at {activity.location}</p>
            
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-1 text-orange-600">
                <Flame className="w-4 h-4" />
                <span>{activity.temp}°C</span>
              </div>
              <div className="flex items-center gap-1 text-blue-600">
                <Droplets className="w-4 h-4" />
                <span>{activity.humidity}%</span>
              </div>
              <div className="flex items-center gap-1 text-purple-600">
                <Timer className="w-4 h-4" />
                <span>{activity.duration}min</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
            <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
              <Heart className="w-4 h-4" />
              <span className="text-sm">{activity.likes}</span>
            </button>
            <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{activity.comments}</span>
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}
