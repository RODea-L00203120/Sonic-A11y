#!/bin/bash
set -e

DOCKER_IMAGE="${docker_image}"
APP_PORT="${app_port}"

# Update system and install Docker
dnf update -y
dnf install -y docker
systemctl start docker
systemctl enable docker

# Wait for Docker to be ready
sleep 10

# Pull and start the application container
docker pull "$DOCKER_IMAGE"
docker stop algobench 2>/dev/null || true
docker rm algobench 2>/dev/null || true
docker run -d \
  --name algobench \
  --restart unless-stopped \
  -p "$APP_PORT:8080" \
  "$DOCKER_IMAGE"

# Install Docker Compose
echo "Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Setup monitoring stack
echo "Setting up monitoring..."
mkdir -p /home/ec2-user/monitoring
cd /home/ec2-user/monitoring

cat > docker-compose.yml <<'EOF'
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana
    restart: unless-stopped

volumes:
  prometheus-data:
  grafana-data:
EOF

cat > prometheus.yml <<'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'algobench'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['172.17.0.1:8080']
EOF

# Start monitoring stack
/usr/local/bin/docker-compose up -d

echo "Monitoring setup complete!"