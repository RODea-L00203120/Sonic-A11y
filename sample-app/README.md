# AlgoBench - Sample Application

A Java/Spring Boot algorithm benchmarking application that compares sorting algorithms across different input sizes and data distributions. Used as a sample workload to generate real metrics for the [A11y](../README.md) sonification plugin.

## Tech Stack

- **Language:** Java 21 (Eclipse Temurin)
- **Framework:** Spring Boot 3.5.8
- **Build Tool:** Gradle 8.12.1
- **Testing:** JUnit 5.12.2
- **Containerisation:** Docker / Docker Compose
- **Monitoring:** Prometheus, Grafana
- **Cloud Platform:** Azure (deployment pending)

## Metrics Exposed

The application exposes JVM and application metrics via Spring Boot Actuator:

- `/actuator/prometheus` — Prometheus scrape endpoint
- `/actuator/health` — Health check
- `/actuator/metrics` — Application metrics

These metrics (CPU load, memory usage, request rates) serve as the live data source for the A11y sonification plugin.

## Local Development

### Build and run

```bash
./gradlew build
./gradlew bootRun
# Access at http://localhost:8080
```

### Run with Docker

```bash
docker build -t algobench:latest .
docker run -p 8080:8080 algobench:latest
```

### Run with monitoring stack

```bash
# Start the app
docker compose up -d

# Start Prometheus and Grafana
cd monitoring
docker compose up -d
```

- Application: http://localhost:8080
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (admin/admin)

### Run tests

```bash
./gradlew test
```

### API Endpoints

```bash
curl http://localhost:8080/actuator/health
curl http://localhost:8080/api/benchmark/bubblesort?size=100
```

## Azure Deployment

_To be documented once deployment is configured._

## Project Structure

```
sample-app/
├── src/                    # Java source and tests
├── monitoring/             # Prometheus and Grafana config
├── Dockerfile              # Multi-stage build
├── docker-compose.yml      # Application container
└── build.gradle.kts        # Gradle build config
```
