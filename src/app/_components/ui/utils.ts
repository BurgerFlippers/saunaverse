import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const formatDuration = (ms: number) => {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago";
  }
  return Math.floor(seconds) + " seconds ago";
}

export function generateSessionTitle(
  startDate: Date | string,
  sessionId: string,
  avgTemp?: number | null,
): string {
  const date = new Date(startDate);
  const hour = date.getHours();

  // Time of day
  let timeOfDay = "Day";
  if (hour < 5) timeOfDay = "Late Night";
  else if (hour < 10) timeOfDay = "Morning";
  else if (hour < 14) timeOfDay = "Midday";
  else if (hour < 18) timeOfDay = "Afternoon";
  else if (hour < 22) timeOfDay = "Evening";
  else timeOfDay = "Night";

  // Temperature adjective
  let tempAdjective = "";
  if (avgTemp) {
    if (avgTemp < 60) tempAdjective = "Gentle";
    else if (avgTemp < 80) tempAdjective = "Classic";
    else if (avgTemp < 95) tempAdjective = "Hot";
    else tempAdjective = "Intense";
  }

  // Deterministic random seed from sessionId
  let seed = 0;
  for (let i = 0; i < sessionId.length; i++) {
    seed = (seed << 5) - seed + sessionId.charCodeAt(i);
    seed |= 0; // Convert to 32bit integer
  }
  
  // Simple LCG for deterministic randomness
  const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return Math.abs(seed / 233280);
  };

  const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)] as T;

  const adjectives = [
    "Relaxing",
    "Quick",
    "Deep",
    "Meditative",
    "Refreshing",
    "Social",
    "Peaceful",
    "Sweaty",
    "Recovery",
    "Casual",
  ];
  const nouns = ["Sauna", "Löyly", "Session", "Heat", "Steam", "Sweat"];

  // Patterns
  // 0: [Time] [Noun]
  // 1: [Adjective] [Noun]
  // 2: [Time] [Noun]
  // 3: [Adjective] [Time] [Noun]
  // 4: [Temp] [Noun] (if temp available)
  // 5: [Time] [Temp] [Noun] (if temp available)
  
  const availablePatterns = [0, 1, 2, 3];
  if (tempAdjective) {
    availablePatterns.push(4, 5);
  }

  const pattern = getRandomItem(availablePatterns);
  const noun = getRandomItem(nouns);
  const adj = getRandomItem(adjectives);

  switch (pattern) {
    case 0: return `${timeOfDay} ${noun}`;
    case 1: return `${adj} ${noun}`;
    case 2: return `${timeOfDay} ${noun}`; // Weighting simple ones more
    case 3: return `${adj} ${timeOfDay} ${noun}`;
    case 4: return `${tempAdjective} ${noun}`;
    case 5: return `${timeOfDay} ${tempAdjective} ${noun}`;
    default: return `${timeOfDay} ${noun}`;
  }
}