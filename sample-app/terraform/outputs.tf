output "public_ip" {
  value = aws_eip.app.public_ip
}

output "application_url" {
  value = "http://${aws_eip.app.public_ip}:${var.app_port}"
}