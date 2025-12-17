# Saunaverse

# Todo:

## Todo:

- Sauna sync for custom saunas does not work?
- Figure out schema for Polar integration
- Integrate Polar with sessions
  - How to keep Polar measurements user-specific while sauna measurements are sauna-specific?

## How to run

- Install docker
- Install dependencies: `npm install`
- Setup secrets: `cp .env.example .env` and set tokens as needed
- Run DB in development: `docker compose -f docker-compose.dev.yml up -d`
- Push schema to DB: `npx prisma db push`
- Run server: `npm run dev`

testissä
