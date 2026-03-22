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