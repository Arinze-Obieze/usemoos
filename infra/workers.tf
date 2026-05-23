# ── ECR ─────────────────────────────────────────────────────────────────────

resource "aws_ecr_repository" "workers" {
  name                 = "usemoose-workers"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "workers" {
  repository = aws_ecr_repository.workers.name

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

# ── Security Group (egress only — no inbound, no ALB) ───────────────────────

resource "aws_security_group" "workers_ecs" {
  name   = "usemoose-workers-ecs"
  vpc_id = data.aws_vpc.default.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ── CloudWatch Logs ──────────────────────────────────────────────────────────

resource "aws_cloudwatch_log_group" "workers" {
  name              = "/ecs/usemoose-workers"
  retention_in_days = 30
}

# ── IAM ─────────────────────────────────────────────────────────────────────

resource "aws_iam_role" "workers_execution" {
  name               = "usemoose-workers-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}

resource "aws_iam_role_policy_attachment" "workers_execution_managed" {
  role       = aws_iam_role.workers_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "workers_execution_ssm" {
  name = "ssm-read"
  role = aws_iam_role.workers_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ssm:GetParameters", "secretsmanager:GetSecretValue"]
      Resource = "*"
    }]
  })
}

resource "aws_iam_role" "workers_task" {
  name               = "usemoose-workers-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}

resource "aws_iam_role_policy" "workers_task_permissions" {
  name = "s3-access"
  role = aws_iam_role.workers_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
      Resource = "*"
    }]
  })
}

# ── ECS Task Definition ──────────────────────────────────────────────────────
# Secrets are read from SSM Parameter Store at /usemoose/workers/<NAME>.
# Create each parameter with:
#   aws ssm put-parameter --name /usemoose/workers/REDIS_URL --value "..." --type SecureString

resource "aws_ecs_task_definition" "workers" {
  family                   = "usemoose-workers"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.workers_cpu
  memory                   = var.workers_memory
  execution_role_arn       = aws_iam_role.workers_execution.arn
  task_role_arn            = aws_iam_role.workers_task.arn

  container_definitions = jsonencode([{
    name  = "usemoose-workers"
    image = "${aws_ecr_repository.workers.repository_url}:latest"
    environment = [
      { name = "NODE_ENV",   value = "production" },
      { name = "AWS_REGION", value = var.aws_region },
    ]
    secrets = [
      { name = "DATABASE_URL",          valueFrom = "/usemoose/workers/DATABASE_URL" },
      { name = "REDIS_URL",             valueFrom = "/usemoose/workers/REDIS_URL" },
      { name = "NANGO_SECRET_KEY",      valueFrom = "/usemoose/workers/NANGO_SECRET_KEY" },
      { name = "ANTHROPIC_API_KEY",     valueFrom = "/usemoose/workers/ANTHROPIC_API_KEY" },
      { name = "PINECONE_API_KEY",      valueFrom = "/usemoose/workers/PINECONE_API_KEY" },
      { name = "COHERE_API_KEY",        valueFrom = "/usemoose/workers/COHERE_API_KEY" },
      { name = "S3_BUCKET",             valueFrom = "/usemoose/workers/S3_BUCKET" },
      { name = "UNSTRUCTURED_API_KEY",  valueFrom = "/usemoose/workers/UNSTRUCTURED_API_KEY" },
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.workers.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

# ── ECS Service ──────────────────────────────────────────────────────────────

resource "aws_ecs_service" "workers" {
  name            = "usemoose-workers"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.workers.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = data.aws_subnets.public.ids
    security_groups  = [aws_security_group.workers_ecs.id]
    assign_public_ip = true
  }

  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
}
