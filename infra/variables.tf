variable "aws_region" {
  default = "eu-north-1"
}

variable "app_name" {
  default = "usemoose-marketing"
}

variable "domain" {
  default = "usemoos.com"
}

variable "container_port" {
  default = 3000
}

variable "task_cpu" {
  default = 256
}

variable "task_memory" {
  default = 512
}

variable "desired_count" {
  default = 1
}

variable "api_port" {
  default = 3001
}

variable "api_cpu" {
  default = 256
}

variable "api_memory" {
  default = 512
}

variable "workers_cpu" {
  default = 256
}

variable "workers_memory" {
  default = 512
}
