#!/bin/bash
set -e
cd "$(dirname "$0")/.."

./scripts/start-db.sh || true

echo "Installing dependencies..."
npm install
cd backend && npm install
cd ../admin-web && npm install
cd ..

echo "Setting up database..."
cd backend
npx prisma generate
npx prisma migrate deploy
npm run seed
cd ..

echo "Flutter pub get..."
cd app_teacher && flutter pub get
cd ../app_student && flutter pub get
cd ..

echo ""
echo "Setup complete! Run: ./scripts/dev.sh"
