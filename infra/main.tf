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
  subscription_id = var.subscription_id
}

resource "azurerm_resource_group" "a11y" {
  name     = var.resource_group_name
  location = var.location
}
