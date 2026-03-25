# A11y - An Audible Observability Tool
A sound-based ambient monitoring tool for non-visual modality based monitoring of VM CPU load, RAM Usage and continuous error logging.  

This repository was created in order to develop, maintain and host documentation pertaining an academic research project undertaken by a student(L00203120) of the Disruptive DevOps module at The Atlantic Technological University. 


## Project Description 

- Visual Modality 
- Alternative - multi-talking, visually impaired, non-critical contextual awareness
- Notifying when engaged elsewhere
- DevOps role often involve multiple threads/tasks and a background method of notification may be of benefit
- Developed with considerations for cognitive load and those with potential visual impairments in mind, however further studies would be required to refine for such purposes. 

## Technology Employed

- Grafana/Prometheus based

## How to Run Locally

### Dev Containers

Two VS Code dev containers are provided (`.devcontainer/`):

| Container | Use case |
|---|---|
| **A11y - Plugin Hot Dev** | Plugin development only — Node 22, Docker. Lightweight and fast. |
| **A11y - Audible Observability Tool** | Full stack — Java 21, Node 22, Azure CLI, OpenTofu. For sample app, infra, and end-to-end work. |

Open the repo in VS Code → **Dev Containers: Reopen in Container** → pick the one you need.

### Plugin Hot Dev (two terminals)

```bash
# Terminal 1 — watch and rebuild on save
cd a11y-a11ysonification-panel && npm run dev

# Terminal 2 — run Grafana with plugin mounted
cd a11y-a11ysonification-panel && npm run server
```

Open http://localhost:3000 (admin / admin). A provisioned sample dashboard with TestData is included — no external data source needed.

> **Port conflict?** Stop any existing Grafana first: `docker stop grafana`

### Full Stack (sample app + monitoring)

```bash
docker network create a11y-net
cd sample-app && docker compose up -d --build
cd monitoring && docker compose up -d
```

### Audio Architecture

The sonification engine lives in `a11y-a11ysonification-panel/src/audio/`:

```
SoundPreset.ts          — interface all sound presets implement
MasterChain.ts          — shared output chain: volume → safety limiter → speakers
DataScaler.ts           — extracts Grafana metric data, normalizes to 0–1
presets/
  SynthA11y.ts          — sawtooth chord with metric-driven filter, LFO, distortion
```

New sounds are added by creating a class in `presets/` implementing the `SoundPreset` interface. Goal: 3 metrics x 3 presets.

### Cloud Deployment

- Include links here

## Demonstration

- Images/Link to recording
- Link to Paper

### Sample Application for Demonstration Purposes

The [AlgoBench](sample-app/) application is included as a sample workload to generate real metrics for the A11y sonification plugin. It is a Java/Spring Boot algorithm benchmarking tool that compares sorting algorithms across different input sizes and data distributions.

**Tech Stack:** Java 21, Spring Boot 3, Gradle, Docker, Prometheus, Grafana

**Role in A11y:** AlgoBench exposes JVM and application metrics via Spring Boot Actuator and a Prometheus endpoint. These metrics (CPU load, memory usage, request rates) serve as the live data source that the A11y plugin will sonify. The application will be deployed on Azure to provide a persistent, accessible demonstration environment.

## To-Do

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Conclusion






