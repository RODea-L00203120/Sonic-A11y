terraform {
  required_version = ">= 1.11.0"

  required_providers {
    azurerm = {
      source  = "opentofu/azurerm"
      version = "~> 4.65"
    }
  }
}

provider "azurerm" {
  features {}
  subscription_id                = var.subscription_id
  resource_provider_registrations = "none"
}

resource "azurerm_resource_provider_registration" "compute" {
  name = "Microsoft.Compute"
}

resource "azurerm_resource_provider_registration" "network" {
  name = "Microsoft.Network"
}

resource "azurerm_resource_group" "a11y" {
  name     = var.resource_group_name
  location = var.location
}
