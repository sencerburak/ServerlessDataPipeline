variable "region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-2"
}

variable "bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
  default     = "lambda-ingress-bucket"
}

variable "queue_name" {
  description = "Name of the SQS queue"
  type        = string
  default     = "output-queue"
}

variable "dynamodb_table_name" {
  description = "Name of the DynamoDB table"
  type        = string
  default     = "processed_data"
}

variable "lambda_config" {
  description = "Configuration for the Lambda function"
  type = object({
    filename      = string
    function_name = string
    handler       = string
    runtime       = string
    memory_size   = number
    timeout       = number
  })

  default = {
    filename      = "processor.zip"
    function_name = "processor"
    handler       = "index.handler"
    runtime       = "nodejs14.x"
    memory_size   = 128
    timeout       = 42
  }
}

output "uploader_arn" {
  description = "ARN of the IAM user for uploading files to S3"
  value       = aws_iam_user.uploader.arn
}
