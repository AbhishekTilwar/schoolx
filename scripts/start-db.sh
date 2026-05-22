#!/bin/bash
set -e
cd "$(dirname "$0")/.."

if command -v docker &>/dev/null; then
  echo "Starting PostgreSQL via Docker on port 5433..."
  docker compose up -d postgres
  echo "Waiting for database..."
  sleep 5
  exit 0
fi

echo "Docker not found. Using local PostgreSQL."
echo "Ensure PostgreSQL is running and create database:"
echo "  createdb schoolx 2>/dev/null || true"
echo "Update backend/.env DATABASE_URL if not using default port 5432"
echo "  Example: postgresql://YOUR_USER@localhost:5432/schoolx?schema=public"
