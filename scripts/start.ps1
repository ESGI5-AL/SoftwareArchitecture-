#Requires -Version 5
$ErrorActionPreference = "Stop"

Write-Host "=== ParkManager - Start ==="

Set-Location (Split-Path $PSScriptRoot -Parent)

# 1. Install backend deps if needed
if (-not (Test-Path "backend/node_modules")) {
    Write-Host "[1/4] Installing backend dependencies..."
    Push-Location backend
    npm install --legacy-peer-deps
    Pop-Location
} else {
    Write-Host "[1/4] Backend deps OK"
}

# 2. Install frontend deps if needed
if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "[2/4] Installing frontend dependencies..."
    Push-Location frontend
    npm install
    Pop-Location
} else {
    Write-Host "[2/4] Frontend deps OK"
}

# 3. Stop old containers
Write-Host "[3/4] Stopping old containers..."
$prev = $ErrorActionPreference
$ErrorActionPreference = "Continue"
docker compose -f docker/docker-compose.yml down -v 2>&1 | Where-Object { $_ -notmatch "^time=" } | Write-Host
$ErrorActionPreference = $prev

# 4. Build and start
Write-Host "[4/4] Building and starting all services..."
docker compose -f docker/docker-compose.yml up --build -d

Write-Host ""
Write-Host "=== Waiting for services ==="

# Wait for database
Write-Host -NoNewline "Database..."
while ($true) {
    $result = docker exec parking-db pg_isready -U parking -d parking_db 2>$null
    if ($LASTEXITCODE -eq 0) { break }
    Start-Sleep -Seconds 1
    Write-Host -NoNewline "."
}
Write-Host " ready!"

# Wait for backend
Write-Host -NoNewline "Backend..."
$ready = $false
for ($i = 1; $i -le 30; $i++) {
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:5050/api/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        Write-Host " ready!"
        $ready = $true
        break
    } catch {
        Start-Sleep -Seconds 1
        Write-Host -NoNewline "."
    }
}
if (-not $ready) {
    Write-Host " FAILED"
    docker compose -f docker/docker-compose.yml logs backend --tail 20
    exit 1
}

# Wait for frontend
Write-Host -NoNewline "Frontend..."
$ready = $false
for ($i = 1; $i -le 20; $i++) {
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        Write-Host " ready!"
        $ready = $true
        break
    } catch {
        Start-Sleep -Seconds 1
        Write-Host -NoNewline "."
    }
}
if (-not $ready) {
    Write-Host " FAILED"
    docker compose -f docker/docker-compose.yml logs frontend --tail 20
    exit 1
}

Write-Host ""
Write-Host "=== All services running ==="
Write-Host "  Frontend:  http://localhost:3000"
Write-Host "  Backend:   http://localhost:5050/api/health"
Write-Host "  RabbitMQ:  http://localhost:15672  (parking / parking123)"
Write-Host "  Database:  localhost:5432  (parking / parking123)"
Write-Host ""
Write-Host "Logs: docker compose -f docker/docker-compose.yml logs -f"
