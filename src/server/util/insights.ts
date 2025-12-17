import { Post } from "@/generated/prisma/client";

export enum InsightType {
  LIFE_EXPECTANCY = "LIFE_EXPECTANCY",
  SLEEP_QUALITY = "SLEEP_QUALITY",
  CARDIOVASCULAR_HEALTH = "CARDIOVASCULAR_HEALTH",
  STRESS_LEVELS = "STRESS_LEVELS",
}

export type Insight = {
  type: InsightType;
  value: number;
  label: string;
};

const INSIGHT_GENERATORS: Record<InsightType, (post: Post) => Insight | null> =
  {
    [InsightType.LIFE_EXPECTANCY]: (post) => {
      if (!post.duration || !post.temperature) return null;
      const minutesGained = (post.duration / 60) * (post.temperature / 25);
      return {
        type: InsightType.LIFE_EXPECTANCY,
        value: minutesGained,
        label: `+${minutesGained.toFixed(0)} minutes to your life expectancy`,
      };
    },
    [InsightType.SLEEP_QUALITY]: (post) => {
      if (!post.duration || !post.temperature) return null;
      const boostPercent = (post.temperature * (post.duration / 60)) / 12;
      return {
        type: InsightType.SLEEP_QUALITY,
        value: boostPercent,
        label: `+${boostPercent.toFixed(0)}% boost to your sleep quality`,
      };
    },
    [InsightType.CARDIOVASCULAR_HEALTH]: (post) => {
      if (!post.calories) return null;
      const runEquivalentKm = post.calories / 70;
      return {
        type: InsightType.CARDIOVASCULAR_HEALTH,
        value: runEquivalentKm,
        label: `Equivalent to a ${runEquivalentKm.toFixed(1)} km run`,
      };
    },
    [InsightType.STRESS_LEVELS]: (post) => {
      if (!post.duration) return null;
      const reductionPercent = (post.duration / 60) * 1.5;
      const cappedReduction = Math.min(reductionPercent, 50);
      return {
        type: InsightType.STRESS_LEVELS,
        value: cappedReduction,
        label: `-${cappedReduction.toFixed(0)}% reduction in stress levels`,
      };
    },
  };

export const ALL_INSIGHT_TYPES = Object.values(InsightType);

export const generateInsight = (post: Post): Insight | null => {
  const possibleGenerators = Object.entries(INSIGHT_GENERATORS).filter(
    ([_, generator]) => generator(post) !== null,
  );

  if (possibleGenerators.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * possibleGenerators.length);
  const selectedGenerator = possibleGenerators[randomIndex]?.[1];

  if (!selectedGenerator) {
    return null;
  }

  return selectedGenerator(post);
};
