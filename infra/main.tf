terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = var.region
}

resource "aws_s3_bucket" "input_bucket" {
  bucket = var.bucket_name
  acl    = "private"

  tags = merge(local.common_tags, {
    ResourceType = "S3Bucket"
  })
}

resource "aws_sqs_queue" "output_queue" {
  name = var.queue_name

  tags = merge(local.common_tags, {
    ResourceType = "SQSQueue"
  })
}

resource "aws_dynamodb_table" "processed_data" {
  name         = var.dynamodb_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "hash"

  attribute {
    name = "hash"
    type = "S"
  }

  attribute {
    name = "customer_reference"
    type = "S"
  }

  stream_enabled   = true
  stream_view_type = "NEW_IMAGE"

  global_secondary_index {
    name            = "customer_reference_index"
    hash_key        = "customer_reference"
    write_capacity  = 1
    read_capacity   = 1
    projection_type = "ALL"
  }

  lifecycle {
    prevent_destroy = true
  }

  tags = merge(local.common_tags, {
    ResourceType = "DynamoDBTable"
  })
}

resource "aws_iam_user" "uploader" {
  name = "lambda-user"

  tags = merge(local.common_tags, {
    ResourceType = "IAMUser"
  })
}

resource "aws_iam_role" "lambda_role" {
  name = "lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(local.common_tags, {
    ResourceType = "IAMRole"
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic_role" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_role.name
}

resource "aws_iam_role_policy_attachment" "lambda_role_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
  role       = aws_iam_role.lambda_role.name
}

resource "aws_iam_role_policy_attachment" "lambda_s3_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
  role       = aws_iam_role.lambda_role.name
}

resource "aws_iam_role_policy_attachment" "lambda_sqs_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonSQSFullAccess"
  role       = aws_iam_role.lambda_role.name
}

resource "aws_lambda_permission" "allow_bucket" {
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.processor.arn
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.input_bucket.arn
}

resource "aws_lambda_function" "processor" {
  filename      = var.lambda_config.filename
  function_name = var.lambda_config.function_name
  role          = aws_iam_role.lambda_role.arn
  handler       = var.lambda_config.handler
  runtime       = var.lambda_config.runtime
  memory_size   = var.lambda_config.memory_size
  timeout       = var.lambda_config.timeout
  environment {
    variables = {
      S3_BUCKET      = aws_s3_bucket.input_bucket.id
      SQS_QUEUE      = aws_sqs_queue.output_queue.arn
      DYNAMODB_TABLE = aws_dynamodb_table.processed_data.name
    }
  }

  tags = merge(local.common_tags, {
    ResourceType = "LambdaFunction"
  })
}

resource "aws_s3_bucket_notification" "aws-lambda-trigger" {
  bucket = aws_s3_bucket.input_bucket.id
  lambda_function {
    lambda_function_arn = aws_lambda_function.processor.arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "customers_"
  }


  depends_on = [
    aws_s3_bucket.input_bucket,
    aws_lambda_function.processor,
    aws_lambda_permission.allow_bucket
  ]
}

resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${aws_lambda_function.processor.function_name}"
  retention_in_days = 30

  tags = merge(local.common_tags, {
    ResourceType = "CloudWatchLogGroup"
  })
}
