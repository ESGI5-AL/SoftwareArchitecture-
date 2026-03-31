#!/bin/bash
echo "=== Stopping all services ==="
cd "$(dirname "$0")/.."
docker compose -f docker/docker-compose.yml down -v
echo "Done."
