output "public_ip" {
  description = "Public IP address of the VM"
  value       = azurerm_public_ip.a11y.ip_address
}

output "app_url" {
  description = "URL of the sample application"
  value       = "http://${azurerm_public_ip.a11y.ip_address}:8080"
}

output "grafana_url" {
  description = "URL of the Grafana dashboard"
  value       = "http://${azurerm_public_ip.a11y.ip_address}:3000"
}

output "prometheus_url" {
  description = "URL of the Prometheus dashboard"
  value       = "http://${azurerm_public_ip.a11y.ip_address}:9090"
}

output "ssh_command" {
  description = "SSH command to connect to the VM"
  value       = "ssh ${var.admin_username}@${azurerm_public_ip.a11y.ip_address}"
}
