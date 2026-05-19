terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment and configure after creating an S3 bucket for state:
  # backend "s3" {
  #   bucket = "usemoose-terraform-state"
  #   key    = "marketing/terraform.tfstate"
  #   region = "eu-north-1"
  # }
}

provider "aws" {
  region = var.aws_region
}

# Separate provider in us-east-1 for CloudFront ACM certificate
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "public" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

