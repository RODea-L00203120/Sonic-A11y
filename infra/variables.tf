variable "subscription_id" {
  description = "Azure subscription ID"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the Azure resource group"
  type        = string
  default     = "rg-a11y"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "uksouth"
}

variable "vm_size" {
  description = "Azure VM size - B1s is free tier eligible (750 hrs/month for 12 months)"
  type        = string
  default     = "Standard_B1s"
}

variable "admin_username" {
  description = "Admin username for the VM"
  type        = string
  default     = "azureuser"
}

variable "docker_image" {
  description = "Container image for the sample app"
  type        = string
  default     = "ghcr.io/rodea-l00203120/a11y-sample-app:latest"
}

variable "allowed_ip" {
  description = "IP address allowed to access the VM (e.g. your public IP). Use '*' for open access (not recommended)"
  type        = string
}

variable "ssh_public_key_path" {
  description = "Path to the SSH public key for VM access"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}
