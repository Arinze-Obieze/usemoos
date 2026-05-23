resource "aws_ecs_cluster" "main" {
  name = "usemoose"
}

resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/${var.app_name}"
  retention_in_days = 30
}

resource "aws_ecs_task_definition" "app" {
  family                   = var.app_name
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  execution_role_arn       = aws_iam_role.execution.arn
  task_role_arn            = aws_iam_role.task.arn

  container_definitions = jsonencode([{
    name  = var.app_name
    image = "${aws_ecr_repository.app.repository_url}:latest"
    portMappings = [{
      containerPort = var.container_port
      protocol      = "tcp"
    }]
    environment = [
      { name = "AWS_REGION",                                       value = var.aws_region },
      { name = "NODE_ENV",                                         value = "production" },
      { name = "NEXT_PUBLIC_CLERK_SIGN_IN_URL",                    value = "/sign-in" },
      { name = "NEXT_PUBLIC_CLERK_SIGN_UP_URL",                    value = "/sign-up" },
      { name = "NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL",  value = "/workspace" },
      { name = "NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL",  value = "/workspace" },
    ]
    secrets = [
      { name = "CLERK_SECRET_KEY",                  valueFrom = "/usemoose/web/CLERK_SECRET_KEY" },
      { name = "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", valueFrom = "/usemoose/web/NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" },
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.app.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

resource "aws_ecs_service" "app" {
  name            = var.app_name
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = data.aws_subnets.public.ids
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = var.app_name
    container_port   = var.container_port
  }

  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  depends_on = [aws_lb_listener.https]
}
