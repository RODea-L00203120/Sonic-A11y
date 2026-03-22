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
