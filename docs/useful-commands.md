# Useful Commands

## Azure CLI

```bash
# Log in (device code flow works best from containers)
az login --use-device-code

# Show current subscription details
az account show --output table

# List available regions for the subscription
az account list-locations --output table

# List available VM sizes in a region
az vm list-skus --location uksouth --resource-type virtualMachines --output table
```

## OpenTofu

```bash
cd infra

# Initialise providers
tofu init

# Preview changes
tofu plan -var="subscription_id=<SUB_ID>" -var="allowed_ip=<YOUR_IP>"

# Apply changes
tofu apply

# Tear down all resources
tofu destroy
```

## Node Version Management (nvm)

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Install Node 22 (required for Grafana plugin tooling)
nvm install 22

# Switch to Node 22 (reads .nvmrc if present)
nvm use

# Check active version
node --version
```

## Dev Containers

```bash
# In VS Code: Ctrl+Shift+P → "Dev Containers: Reopen in Container"
# Choose:
#   "A11y - Plugin Hot Dev"              — Node 22 + Docker only (plugin development)
#   "A11y - Audible Observability Tool"  — Full stack (Java, Node, Azure CLI, OpenTofu)
```

## Grafana Plugin Development

```bash
cd sonic-a11y-panel

# Install dependencies
npm install

# Terminal 1 — build and watch (rebuilds on save)
npm run dev

# Terminal 2 — start Grafana with plugin mounted
npm run server

# Open Grafana at http://localhost:3000 (admin/admin)
# A provisioned sample dashboard with TestData is included

# If port 3000 is already in use (e.g. monitoring stack Grafana)
docker stop grafana

# Type check
npm run typecheck

# Lint
npm run lint
```

## Docker (Local Development)

```bash
# Create the shared network (required before starting either stack)
docker network create a11y-net

# Build and start the sample app
cd sample-app
docker compose up -d --build

# Start the monitoring stack (Prometheus + Grafana)
cd monitoring
docker compose up -d

# Stop everything
cd sample-app && docker compose down
cd monitoring && docker compose down

# Clear build cache if Docker builds fail with stale snapshots
docker builder prune -f
```

## Useful Endpoints (Local)

- App: http://localhost:8080
- Health check: GET http://localhost:8080/api/health
- Run benchmarks: POST http://localhost:8080/api/benchmark
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (admin/admin)

## PromQL Queries

```promql
# CPU usage
process_cpu_usage

# Heap memory usage
jvm_memory_used_bytes{area="heap"}

# HTTP request count
http_server_requests_seconds_count

# Active threads
jvm_threads_live_threads
```