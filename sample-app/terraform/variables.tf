variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}

variable "app_port" {
  type    = number
  default = 8080
}

variable "docker_image" {
  type    = string
  default = "ghcr.io/rodea-l00203120/devops_swe_pipeline:latest"
}