variable "region" {
  description = "AWS region"
  default     = "eu-west-2"
}

variable "bucket_name" {
  description = "Name of the S3 bucket"
  default     = "lambda-ingress-bucket"
}

variable "queue_name" {
  description = "Name of the SQS queue"
  default     = "output-queue"
}

variable "dynamodb_table_name" {
  description = "Name of the DynamoDB table"
  default     = "processed_data"
}

variable "lambda_function_name" {
  description = "Name of the Lambda function"
  default     = "processor"
}

variable "lambda_handler" {
  description = "Handler of the Lambda function"
  default     = "index.handler"
}

variable "lambda_runtime" {
  description = "Runtime of the Lambda function"
  default     = "nodejs14.x"
}

variable "lambda_memory_size" {
  description = "Memory size of the Lambda function (in MB)"
  default     = 128
}

variable "lambda_timeout" {
  description = "Timeout of the Lambda function (in seconds)"
  default     = 42
}

output "uploader_arn" {
  description = "ARN of the IAM user for uploading files to S3"
  value       = aws_iam_user.uploader.arn
}
