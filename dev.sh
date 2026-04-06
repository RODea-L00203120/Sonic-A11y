#!/usr/bin/env bash
# Start full dev environment: sample app + Prometheus + Grafana plugin + hot-reload
set -e

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

# Tear down containers and remove images so builds are always fresh
echo "Cleaning up..."
docker compose -f "$REPO_ROOT/sample-app/docker-compose.yml" down 2>/dev/null || true
docker compose -f "$REPO_ROOT/monitoring/docker-compose.yml" down 2>/dev/null || true
docker compose -f "$REPO_ROOT/sonic-a11y-panel/docker-compose.yaml" down 2>/dev/null || true
docker rmi algobench:latest 2>/dev/null || true

docker network create a11y-net 2>/dev/null || true

echo "Building and starting sample app..."
docker compose -f "$REPO_ROOT/sample-app/docker-compose.yml" build
docker compose -f "$REPO_ROOT/sample-app/docker-compose.yml" up -d

echo "Starting Prometheus..."
docker compose -f "$REPO_ROOT/monitoring/docker-compose.yml" up -d prometheus

echo "Building and starting Grafana with plugin..."
docker compose -f "$REPO_ROOT/sonic-a11y-panel/docker-compose.yaml" build
docker compose -f "$REPO_ROOT/sonic-a11y-panel/docker-compose.yaml" up -d

echo "All services up. Starting webpack watch..."
cd "$REPO_ROOT/sonic-a11y-panel" && npm run dev
