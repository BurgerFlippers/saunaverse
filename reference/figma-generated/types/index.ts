export interface Session {
  id: string;
  userName: string;
  timestamp: string;
  location?: string;
  description?: string;
  maxTemp: number;
  maxHumidity: number;
  duration: number;
  chartData: ChartDataPoint[];
  notes?: string;
  likes: number;
  badges: string[];
  photos?: string[];
}

export interface ChartDataPoint {
  time: string;
  temperature: number;
  humidity: number;
}

export interface UserStats {
  currentStreak: number;
  totalSessions: number;
  totalMinutes: number;
  maxTemp: number;
}

export interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
}