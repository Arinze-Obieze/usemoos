# ── ECR ─────────────────────────────────────────────────────────────────────

resource "aws_ecr_repository" "api" {
  name                 = "usemoose-api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "api" {
  repository = aws_ecr_repository.api.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}

# ── Security Groups ──────────────────────────────────────────────────────────

resource "aws_security_group" "api_alb" {
  name   = "usemoose-api-alb"
  vpc_id = data.aws_vpc.default.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "api_ecs" {
  name   = "usemoose-api-ecs"
  vpc_id = data.aws_vpc.default.id

  ingress {
    from_port       = var.api_port
    to_port         = var.api_port
    protocol        = "tcp"
    security_groups = [aws_security_group.api_alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ── ACM Certificate (eu-north-1 — same region as ALB) ───────────────────────
# After terraform apply, add the CNAME from output api_cert_validation_records
# in Cloudflare (DNS only, NOT proxied) to validate the certificate.

resource "aws_acm_certificate" "api" {
  domain_name       = "api.${var.domain}"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "api" {
  certificate_arn = aws_acm_certificate.api.arn
}

# ── ALB ─────────────────────────────────────────────────────────────────────

resource "aws_lb" "api" {
  name               = "usemoose-api"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.api_alb.id]
  subnets            = data.aws_subnets.public.ids
}

resource "aws_lb_target_group" "api" {
  name        = "usemoose-api"
  port        = var.api_port
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.default.id
  target_type = "ip"

  health_check {
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
  }
}

resource "aws_lb_listener" "api_http" {
  load_balancer_arn = aws_lb.api.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener" "api_https" {
  load_balancer_arn = aws_lb.api.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate_validation.api.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

# ── CloudWatch Logs ──────────────────────────────────────────────────────────

resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/usemoose-api"
  retention_in_days = 30
}

# ── IAM ─────────────────────────────────────────────────────────────────────

resource "aws_iam_role" "api_execution" {
  name               = "usemoose-api-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}

resource "aws_iam_role_policy_attachment" "api_execution_managed" {
  role       = aws_iam_role.api_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "api_execution_ssm" {
  name = "ssm-read"
  role = aws_iam_role.api_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ssm:GetParameters", "secretsmanager:GetSecretValue"]
      Resource = "*"
    }]
  })
}

resource "aws_iam_role" "api_task" {
  name               = "usemoose-api-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}

resource "aws_iam_role_policy" "api_task_permissions" {
  name = "s3-ses-access"
  role = aws_iam_role.api_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["ses:SendEmail", "ses:SendRawEmail"]
        Resource = "*"
      }
    ]
  })
}

# ── ECS Task Definition ──────────────────────────────────────────────────────
# Secrets are read from SSM Parameter Store at /usemoose/api/<NAME>.
# Create each parameter with:
#   aws ssm put-parameter --name /usemoose/api/DATABASE_URL --value "..." --type SecureString

resource "aws_ecs_task_definition" "api" {
  family                   = "usemoose-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.api_cpu
  memory                   = var.api_memory
  execution_role_arn       = aws_iam_role.api_execution.arn
  task_role_arn            = aws_iam_role.api_task.arn

  container_definitions = jsonencode([{
    name  = "usemoose-api"
    image = "${aws_ecr_repository.api.repository_url}:latest"
    portMappings = [{
      containerPort = var.api_port
      protocol      = "tcp"
    }]
    environment = [
      { name = "NODE_ENV",   value = "production" },
      { name = "PORT",       value = tostring(var.api_port) },
      { name = "AWS_REGION", value = var.aws_region },
      { name = "APP_URL",    value = "https://${var.domain}" },
    ]
    secrets = [
      { name = "DATABASE_URL",          valueFrom = "/usemoose/api/DATABASE_URL" },
      { name = "REDIS_URL",             valueFrom = "/usemoose/api/REDIS_URL" },
      { name = "CLERK_SECRET_KEY",      valueFrom = "/usemoose/api/CLERK_SECRET_KEY" },
      { name = "CLERK_PUBLISHABLE_KEY", valueFrom = "/usemoose/api/CLERK_PUBLISHABLE_KEY" },
      { name = "STRIPE_SECRET_KEY",     valueFrom = "/usemoose/api/STRIPE_SECRET_KEY" },
      { name = "STRIPE_WEBHOOK_SECRET", valueFrom = "/usemoose/api/STRIPE_WEBHOOK_SECRET" },
      { name = "NANGO_SECRET_KEY",      valueFrom = "/usemoose/api/NANGO_SECRET_KEY" },
      { name = "ANTHROPIC_API_KEY",     valueFrom = "/usemoose/api/ANTHROPIC_API_KEY" },
      { name = "PINECONE_API_KEY",      valueFrom = "/usemoose/api/PINECONE_API_KEY" },
      { name = "COHERE_API_KEY",        valueFrom = "/usemoose/api/COHERE_API_KEY" },
      { name = "S3_BUCKET",             valueFrom = "/usemoose/api/S3_BUCKET" },
      { name = "UNSTRUCTURED_API_KEY",  valueFrom = "/usemoose/api/UNSTRUCTURED_API_KEY" },
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.api.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

# ── ECS Service ──────────────────────────────────────────────────────────────

resource "aws_ecs_service" "api" {
  name            = "usemoose-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = data.aws_subnets.public.ids
    security_groups  = [aws_security_group.api_ecs.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "usemoose-api"
    container_port   = var.api_port
  }

  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  depends_on = [aws_lb_listener.api_https]
}
