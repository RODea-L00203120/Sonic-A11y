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

### Quick Start

From the repo root (inside the plugin hot dev container):

```bash
./dev.sh
```

This tears down any existing containers, rebuilds the sample app, starts Prometheus, starts Grafana with the plugin mounted, and runs webpack in watch mode. Open http://localhost:3000 (admin / admin).

> **Port conflict?** Stop any existing Grafana first: `docker stop grafana`

### Manual Steps

```bash
docker network create a11y-net
cd sample-app && docker compose up -d --build   # metric source
cd monitoring && docker compose up -d prometheus # scraper
cd sonic-a11y-panel && docker compose up -d --build && npm run dev
```

### Audio Architecture

The sonification engine lives in `sonic-a11y-panel/src/audio/`:

```
MasterChain.ts              — shared output: volume → makeup gain → brick-wall limiter → speakers
ChannelStrip.ts             — per-metric gain + stereo pan
DataScaler.ts               — extracts Grafana metric data
SoundPreset.ts / BasePreset — preset interface and abstract base class
sounds/                     — reusable sound sources (CpuDrone, RamDrone, BellEarcon)
effects/                    — DSP modules (Glide, LFO, Distortion, DefaultEQ, Reverb)
scalers/                    — per-metric scaling (CpuScaler, RamScaler, ErrorTrigger)
presets/<name>/             — preset composition (DefaultPreset composes sound sources)
```

New sounds are added by implementing `SoundSource` in `sounds/`. New presets compose sources by extending `BasePreset` in `presets/<name>/`.

## Demonstration

Video demonstrations of the plugin in operation can be found in the [demo/](demo/) folder.

- Headphones recommended for playback — stereo panning and reverb depth are not perceptible on laptop speakers.

### Sample Application for Demonstration Purposes

The [AlgoBench](sample-app/) application is included as a sample workload to generate real metrics for the A11y sonification plugin. It is a Java/Spring Boot algorithm benchmarking tool that compares sorting algorithms across different input sizes and data distributions.

**Tech Stack:** Java 21, Spring Boot 3, Gradle, Docker, Prometheus, Grafana

**Role in A11y:** AlgoBench exposes JVM and application metrics via Spring Boot Actuator and a Prometheus endpoint. These metrics (CPU load, memory usage, request rates) serve as the live data source that the A11y plugin will sonify. The application will be deployed on Azure to provide a persistent, accessible demonstration environment.

## To-Do

- Additional presets drawing on ecological acoustics (e.g. nature-based soundscapes)
- User-configurable sonification parameters via a dedicated settings interface to support mapping congruence
- Platform-agnostic refactoring to decouple from JVM-specific metrics via configurable query templates
- Controlled user study evaluating anomaly detection performance and cognitive load across sonification, visual-only, and combined conditions with both sighted and BLV participants
- Migration of complex presets to AudioWorklet if polyphonic counts or real-time convolution exceed main-thread budget
- User-configurable severity grading thresholds (currently fixed in source)
- Streaming data integration to reduce latency between metric change and audible response
- CI/CD validation, end-to-end test coverage, and plugin signing for Grafana community plugin catalogue submission

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Conclusion

Sonic-A11y demonstrates that continuous, literature-informed sonification of DevOps infrastructure metrics is feasible within the Grafana ecosystem using the Web Audio API. The current prototype sonifies three metrics — CPU utilisation, RAM utilisation, and error count — through a modular audio engine with perceptually graded severity mappings informed by psychoacoustic research, embodied cognition theory, and auditory distraction studies. The plugin supports screen reader navigation, per-metric channel controls (volume, pan, mute), and a brick-wall limiter for safe listening levels. While the design is grounded in the literature, empirical validation with both sighted and blind or low-vision users remains as planned future work.






