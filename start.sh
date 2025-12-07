#!/bin/bash
set -e

npx prisma migrate resolve --applied 0_init || echo "0_init already resolved or not needed"

# Run migrations & seed data before starting services
npm run db:push
npm run db:migrate
npm run db:seed

echo "Done"

# Start all apps via pm2-runtime (PID 1 in Docker)
exec pm2-runtime ecosystem.config.cjs