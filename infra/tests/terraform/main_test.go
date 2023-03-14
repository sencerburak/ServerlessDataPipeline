package main_test

import (
	"testing"

	"github.com/gruntwork-io/terratest/modules/aws"
	"github.com/gruntwork-io/terratest/modules/terraform"
)

func TestInfrastructure(t *testing.T) {
	terraformOptions := &terraform.Options{
		TerraformDir: "./",
		Vars: map[string]interface{}{
			"aws_region":  "eu-west-2",
			"bucket_name": "lambda-ingress-bucket",
			"queue_name":  "output-queue",
			"table_name":  "processed_data",
		},
	}
	defer terraform.Destroy(t, terraformOptions)
	terraform.InitAndApply(t, terraformOptions)

	// Verify S3 bucket exists
	bucketName := terraform.Output(t, terraformOptions, "bucket_name")
	s3.AssertS3BucketExists(t, aws.GetS3BucketRegion(t, bucketName), bucketName)

	// Verify SQS queue exists
	queueName := terraform.Output(t, terraformOptions, "queue_name")
	aws.AssertSqsQueueExists(t, aws.GetRegion(t), queueName)

	// Verify DynamoDB table exists
	tableName := terraform.Output(t, terraformOptions, "table_name")
	aws.AssertDynamoDBTableExists(t, aws.GetRegion(t), tableName)
}
