# Development Steps

## Session 1 — Project Setup and Restructuring

- The A11y repository was created on GitHub. Apache 2.0 was chosen as the license after checking compatibility with Prometheus (Apache 2.0), Grafana plugins (Apache 2.0), and the Web Audio API (W3C standard, royalty-free).
- The [DevOps_SWE_Pipeline](https://github.com/RODea-L00203120/DevOps_SWE_Pipeline) repository was cloned into `sample-app/` to act as a sample workload for generating Prometheus metrics. All AWS infrastructure, old Terraform configs, deployment workflows, and screenshots were removed.
- OpenTofu IaC was written under `infra/` targeting Azure free tier (Standard_B1s VM, UK South). A cloud-init script bootstraps Docker and deploys the app and monitoring stack on a single VM.
- The dev container was moved to the repo root and switched from AWS CLI to Azure CLI.
- The monitoring stack (`docker-compose.yml`, `prometheus.yml`) was moved out of `sample-app/` to a root-level `monitoring/` directory so it can be reused with any Prometheus-compatible application.
- The CI workflow was moved to `.github/workflows/` and updated with `working-directory` and path filters for the monorepo layout.
- Redundant files from the cloned repo were cleaned up: nested `.gitignore`, old MIT license, AWS deploy workflow, leftover demo comments in source, spelling errors in the README, and the auto-generated Gradle project name.
