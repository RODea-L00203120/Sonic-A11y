# Development Steps

## Session 1 — Project Setup and Restructuring

- The A11y repository was created on GitHub. Apache 2.0 was chosen as the license after checking compatibility with Prometheus (Apache 2.0), Grafana plugins (Apache 2.0), and the Web Audio API (W3C standard, royalty-free).
- The [DevOps_SWE_Pipeline](https://github.com/RODea-L00203120/DevOps_SWE_Pipeline) repository was cloned into `sample-app/` to act as a sample workload for generating Prometheus metrics. All AWS infrastructure, old Terraform configs, deployment workflows, and screenshots were removed.
- OpenTofu IaC was written under `infra/` targeting Azure free tier (Standard_B1s VM, UK South). A cloud-init script bootstraps Docker and deploys the app and monitoring stack on a single VM.
- The dev container was moved to the repo root and switched from AWS CLI to Azure CLI.
- The monitoring stack (`docker-compose.yml`, `prometheus.yml`) was moved out of `sample-app/` to a root-level `monitoring/` directory so it can be reused with any Prometheus-compatible application.
- The CI workflow was moved to `.github/workflows/` and updated with `working-directory` and path filters for the monorepo layout.
- Redundant files from the cloned repo were cleaned up: nested `.gitignore`, old MIT license, AWS deploy workflow, leftover demo comments in source, spelling errors in the README, and the auto-generated Gradle project name.

## Session 2 — Azure Setup and Dev Environment

- Azure for Students subscription was activated and available regions/VM sizes were checked via the Azure CLI.
- UK South was confirmed as an available region. The VM size was updated from Standard_B1s (1 GiB RAM, free tier) to Standard_B2s (2 vCPUs, 4 GiB RAM, ~$0.04/hr) as the free tier VMs lacked sufficient memory for running Spring Boot, Prometheus, and Grafana together.
- An SSH key pair was generated (`ed25519`) for Azure VM access.
- OpenTofu was added as a dev container feature so infrastructure can be managed from within the development environment.
- The dev container was rebuilt with the updated configuration.
- The azurerm provider's `resource_provider_registrations` was set to `"none"` (recommended default from v5.0+), with explicit `azurerm_resource_provider_registration` resources for Compute and Network — keeping provider registration managed as IaC rather than relying on auto-registration.
- `tofu plan` completed successfully with 10 resources planned. `tofu apply` deferred until deployment is needed.
- The `feature/sample-app` branch was merged to main to begin work on the Grafana plugin.

## Session 3 — Grafana Plugin Scaffolding

- Node 22 was installed via nvm to meet the requirements of `@grafana/create-plugin` (v7.0.8). An `.nvmrc` file was added to the repo root so contributors can run `nvm use` to switch to the correct version.
- The dev container was updated to include the `ghcr.io/devcontainers/features/node:1` feature (Node 22). The discontinued `devcontainers-contrib` OpenTofu feature reference was replaced with `devcontainers-extra`.
- The Grafana panel plugin was scaffolded using `npx @grafana/create-plugin@latest` as a **panel** plugin (`sonic-a11y-panel`). This generates the default template with React/TypeScript source, provisioning, E2E tests (Playwright), Docker dev environment, and GitHub Actions for CI/releases.

## Session 4 — Audio Architecture and Dev Container Split

- The monolithic `SonificationPanel.tsx` was refactored into a modular audio architecture under `src/audio/`:
  - `SoundPreset.ts` — interface that all sound presets implement (`start`, `update`, `stop`).
  - `MasterChain.ts` — shared output chain (volume control → safety limiter → speakers). Owns the `AudioContext`; presets connect into `master.input`.
  - `DataScaler.ts` — extracts the latest numeric value from Grafana panel data and normalizes it to 0–1.
  - `presets/SynthA11y.ts` — the existing sawtooth chord sound extracted as the first preset ("Synth A11y"), with metric-driven LPF cutoff, LFO rate, and waveshaper distortion.
- `SonificationPanel.tsx` was slimmed to a thin React component that wires together the MasterChain, a preset, and the UI (play/stop, volume slider, status).
- The design supports 3 metrics × 3 presets — new sounds are added by creating a class in `presets/` implementing `SoundPreset`.
- A second dev container was added at `.devcontainer/plugin-dev/` for lightweight plugin hot development:
  - Base image: `mcr.microsoft.com/devcontainers/javascript-node:22-bookworm` (pinned to Bookworm to avoid Debian Trixie/Moby incompatibility with docker-in-docker).
  - Features: Docker-in-Docker, Git, GitHub CLI only (no Java, Azure CLI, or OpenTofu).
  - `postCreateCommand` runs `npm install` in the plugin directory.
  - The original full-build dev container at `.devcontainer/devcontainer.json` remains unchanged for end-to-end work.
- VS Code now prompts to choose between "A11y - Plugin Hot Dev" and "A11y - Audible Observability Tool" when reopening in a container.
- The plugin dev workflow uses two terminals: `npm run dev` (webpack watch) + `npm run server` (Grafana via Docker Compose with plugin mounted). TestData is used as the data source — no sample app or Prometheus needed during plugin development.

## Session 5 — Sound Design, Perceptual Scaling, and Architecture Refactor

- Fixed stop button not silencing audio — nodes now disconnect before async `AudioContext.close()`.
- Dashboard switched from static `raw_frame` to `random_walk` with 30s refresh, 5m window.
- Introduced perceptual CPU scaling (`scalers/CpuScaler.ts`) using Stevens' Power Law (exponent 2.0) — compresses idle range, expands critical range. `DataScaler` now only extracts raw values; scaling is per-metric.
- Extracted reusable effects into `audio/effects/`: `Glide`, `LFO`, `Distortion`, `DefaultEQ`, `Reverb`.
- LFO rate mapping changed from linear to exponential. Distortion restricted to 90%+ CPU.
- Added FM bell earcon for error metric with reverb tail and `ErrorTrigger` cooldown logic.
- Refactored panel UI into modular components: `TransportBar`, `MetricChannel`, `MasterVolume`. Power icon replaces play/stop, bell icons for mute, preset dropdown labelled.
- Added `ChannelStrip` (gain + pan per metric) between preset outputs and `MasterChain`.
- `SoundPreset` interface updated to accept `MetricValues` object and `ChannelDestinations` for multi-metric routing.
- Major OOP refactor: introduced `SoundSource` interface and `BasePreset` abstract class. Presets now compose reusable sounds from `audio/sounds/` rather than containing all logic inline. `DefaultPreset` is ~20 lines.
- File structure: `sounds/` (reusable sound sources), `effects/` (DSP modules), `scalers/` (per-metric data scaling), `presets/<name>/` (preset composition).

## Session 6 — Rename, Research Alignment, and Prometheus Integration

- Renamed project artefacts: repo to `Sonic-A11y`, plugin folder to `sonic-a11y-panel`, plugin ID to `sonic-a11y-panel`, display name to "Sonic-A11y", author to "Ronan O'Dea". Updated all references across CLAUDE.md, README, docs, devcontainer, CI, docker-compose, and provisioned dashboard.
- Aligned CPU severity zones with the paper's Table II:
  - Distortion threshold lowered from 81% to 60%, with two-stage curve: light drive (0–3) from 60–85%, heavy drive (3–8) from 85–100%.
  - LFO minimum rate lowered from 0.3 Hz to 0.05 Hz (near-silent at idle).
  - LFO depth increased to 0.2 baseline, ramping to 0.5 above 90% CPU for saliency.
- Implemented RAM sonification per paper's Table III:
  - `RamScaler.ts` — Stevens' Power Law (exponent 2.0), matching CPU scaler.
  - `RamDrone.ts` — sawtooth oscillator at B3 (diatonic seventh against C major triad), with reverb-as-space metaphor (wet/spacious at low utilisation → dry at high), LPF brightness tracking, and subtle pitch rise (B3→B4) with utilisation.
  - Wired into `DefaultPreset` replacing the null RAM slot.
- Multi-metric data routing: `extractLatestValue()` updated to accept a series index. Panel now reads series 0=CPU, 1=RAM, 2=Errors from Grafana queries. Graceful fallback to 0 when a series is absent.
- Provisioned dashboard updated with three TestData random walk queries (CPU 0–100, RAM 0–100, Errors 0–5).
- Added in-panel datasource selector dropdown ("Source") next to Preset dropdown. Defaults to "Test Data" (uses panel queries). Lists available Prometheus datasources via `getDataSourceSrv()`. When Prometheus selected, polls it every 5s with preset PromQL queries directly via `getBackendSrv()`.
- Prometheus datasource provisioned in plugin (`sonic-a11y-panel/provisioning/datasources/datasources.yml`). Plugin Grafana container joined to `a11y-net` for Prometheus access.
- PromQL queries: `process_cpu_usage * on() group_left system_cpu_count` (normalised to single-core), `sum(jvm_memory_used_bytes{area="heap"}) / sum(jvm_memory_max_bytes{area="heap"})` (heap %). Values converted from 0–1 ratio to 0–100 percentage in JS.
- Added `/api/error` endpoint to sample app (`BenchmarkController.java`) that logs via SLF4J, incrementing the `logback_events_total{level="error"}` Prometheus counter.
- Glide duration set to 2 seconds for all metric parameter transitions.
- Output gain fade-in added to both drones: 0% = silent, 0–5% fades in linearly, 5%+ = full volume. Ensures no audible output when metrics report zero.
- Status bar shows 2 decimal places for values below 1% (e.g. `CPU: 0.02%`).
- Prometheus scrape interval reduced from 15s to 5s for demo responsiveness.
- Sample app JVM heap constrained (`-Xmx64m -Xms32m`) so RAM utilisation changes are audible during benchmarks.
- MasterChain extended with `mute()`/`unmute()` methods (disconnect/reconnect limiter from speakers) for guaranteed silence when no data is available.
