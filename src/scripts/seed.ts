import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const achievements = [
    {
      name: "First Sauna Session",
      description: "You posted your first sauna session!",
    },
    {
      name: "Hottest Sauna",
      description: "You took the hottest sauna!",
      metric: "temperature",
      value: "100",
      unit: "°C",
    },
    {
      name: "Longest Sauna",
      description: "You took the longest sauna!",
      metric: "duration",
      value: "2",
      unit: "hours",
    },
    {
      name: "Life Expectancy",
      description: "Increased life expectancy",
      metric: "life expectancy",
      value: "2",
      unit: "years",
    },
    {
      name: "Stress Levels",
      description: "Lowered stress levels",
      metric: "stress levels",
      value: "50",
      unit: "%",
    },
    {
      name: "Immune System",
      description: "Boosted immune system",
      metric: "immune system",
      value: "30",
      unit: "%",
    },
    {
      name: "Sleep Quality",
      description: "Enhanced sleep quality",
      metric: "sleep quality",
      value: "40",
      unit: "%",
    },
    {
      name: "Toxins",
      description: "Released toxins",
      metric: "toxins",
      value: "1",
      unit: "liter",
    },
    {
      name: "Inflammation Markers",
      description: "Reduced inflammation markers",
      metric: "inflammation markers",
      value: "20",
      unit: "%",
    },
    {
      name: "Calories",
      description: "Burned calories",
      metric: "calories",
      value: "300",
      unit: "kcal",
    },
    {
      name: "Cardiovascular Health",
      description: "Improved cardiovascular health",
      metric: "cardiovascular health",
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: {},
      create: achievement,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
