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