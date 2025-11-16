#!/bin/bash
set -e

# Run migrations & seed data before starting services
npm run db:migrate
npm run db:seed

echo "Done"

# Start all apps via pm2-runtime (PID 1 in Docker)
exec pm2-runtime ecosystem.config.js