import { PrismaClient } from "../generated/prisma";

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

  await prisma.user.createMany({
    data: [
      { name: "Mika Virtanen" },
      { name: "Anna Korhonen" },
      { name: "Janne Saunisto" },
      { name: "Emma Lahti" },
      { name: "Petri Mäkinen" },
      { name: "Sari Lehto" },
    ],
    skipDuplicates: true,
  });

  await prisma.sauna.createMany({
    data: [
      { name: "Löyly Helsinki" },
      { name: "Anna's summer cottage (Espoo)" },
      { name: "Home sauna (Kallio)" },
      { name: "Allas Sea Pool" },
      { name: "Family mökkisauna (Järvenpää)" },
      { name: "Apartment building sauna (Töölö)" },
    ],
    skipDuplicates: true,
  });

  const allUsers = await prisma.user.findMany();
  const allSaunas = await prisma.sauna.findMany();

  if (allUsers.length > 0 && allSaunas.length > 0) {
    await prisma.event.createMany({
      data: [
        {
          name: "Friday Night Sauna",
          description:
            "Join us for a relaxing Friday evening sauna session! We'll have some refreshments and good company.",
          date: new Date("2024-11-17T19:00:00Z"),
          location: "Löyly Helsinki",
          maxAttendees: 12,
          saunaId: allSaunas[0]!.id,
          createdById: allUsers[0]!.id,
        },
        {
          name: "Mökkisauna & Grill",
          description:
            "Cozy afternoon at my family cottage! Wood-heated sauna followed by grilling. Bring your own drinks 🌲",
          date: new Date("2024-11-18T15:00:00Z"),
          location: "Anna's summer cottage (Espoo)",
          maxAttendees: 6,
          saunaId: allSaunas[1]!.id,
          createdById: allUsers[1]!.id,
        },
        {
          name: "Sunday Sauna",
          description:
            "Small group session at my place. Electric sauna, good löyly guaranteed!",
          date: new Date("2024-11-19T18:00:00Z"),
          location: "Home sauna (Kallio)",
          maxAttendees: 4,
          saunaId: allSaunas[2]!.id,
          createdById: allUsers[2]!.id,
        },
        {
          name: "Sauna & Chill",
          description:
            "Midweek sauna session to relax and unwind. Open to all levels!",
          date: new Date("2024-11-22T17:00:00Z"),
          location: "Allas Sea Pool",
          maxAttendees: 15,
          saunaId: allSaunas[3]!.id,
          createdById: allUsers[3]!.id,
        },
        {
          name: "Lakeside Sauna Evening",
          description:
            "Traditional lakeside sauna with avanto swimming. Bring warm clothes and towels! 🏊‍♂️",
          date: new Date("2024-11-25T16:00:00Z"),
          location: "Family mökkisauna (Järvenpää)",
          maxAttendees: 8,
          saunaId: allSaunas[4]!.id,
          createdById: allUsers[4]!.id,
        },
        {
          name: "Quick Evening Session",
          description:
            "Just a casual sauna in our building. Low-key and relaxed ☺️",
          date: new Date("2024-11-23T19:30:00Z"),
          location: "Apartment building sauna (Töölö)",
          maxAttendees: 3,
          saunaId: allSaunas[5]!.id,
          createdById: allUsers[5]!.id,
        },
      ],
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
