#!/bin/bash
set -e

echo "=== ParkManager — Start ==="

cd "$(dirname "$0")/.."

# 1. Install backend deps if needed
if [ ! -d "backend/node_modules" ]; then
  echo "[1/4] Installing backend dependencies..."
  cd backend && npm install --legacy-peer-deps && cd ..
else
  echo "[1/4] Backend deps OK"
fi

# 2. Install frontend deps if needed
if [ ! -d "frontend/node_modules" ]; then
  echo "[2/4] Installing frontend dependencies..."
  cd frontend && npm install && cd ..
else
  echo "[2/4] Frontend deps OK"
fi

# 3. Stop old containers
echo "[3/4] Stopping old containers..."
docker compose -f docker/docker-compose.yml down -v 2>/dev/null || true

# 4. Build and start
echo "[4/4] Building and starting all services..."
docker compose -f docker/docker-compose.yml up --build -d

echo ""
echo "=== Waiting for services ==="

echo -n "Database..."
until docker exec parking-db pg_isready -U parking -d parking_db > /dev/null 2>&1; do
  sleep 1; echo -n "."
done
echo " ready!"

echo -n "Backend..."
for i in $(seq 1 30); do
  if curl -s http://localhost:5050/api/health > /dev/null 2>&1; then
    echo " ready!"; break
  fi
  sleep 1; echo -n "."
  if [ $i -eq 30 ]; then
    echo " FAILED"; docker compose -f docker/docker-compose.yml logs backend --tail 20; exit 1
  fi
done

echo -n "Frontend..."
for i in $(seq 1 20); do
  if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo " ready!"; break
  fi
  sleep 1; echo -n "."
  if [ $i -eq 20 ]; then
    echo " FAILED"; docker compose -f docker/docker-compose.yml logs frontend --tail 20; exit 1
  fi
done

echo ""
echo "=== All services running ==="
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:5050/api/health"
echo "  RabbitMQ:  http://localhost:15672  (parking / parking123)"
echo "  Database:  localhost:5432  (parking / parking123)"
echo ""
echo "Logs: docker compose -f docker/docker-compose.yml logs -f"
