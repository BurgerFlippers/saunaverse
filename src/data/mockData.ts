import { type Session } from "../types";

export const mockSessions: Session[] = [
  {
    id: 1,
    userName: "John Saunerson",
    userTitle: "Sauna Enthusiast",
    title: "Perfect evening löyly session",
    location: "Lakeside Sauna, Helsinki",
    duration: "40m 12s",
    avgTemp: 83,
    chartData: [
      { time: "0", temperature: 70, humidity: 18, inSauna: null },
      { time: "10", temperature: 82, humidity: 32, inSauna: 0 },
      { time: "20", temperature: 88, humidity: 48, inSauna: 0 },
      { time: "30", temperature: 92, humidity: 58, inSauna: 0 },
      { time: "40", temperature: 85, humidity: 45, inSauna: null },
    ],
  },
  // ... other mock sessions
];

export const mockUserStats = {
  currentStreak: 7,
  totalSessions: 128,
  totalMinutes: 8320,
  maxTemp: 102,
};
