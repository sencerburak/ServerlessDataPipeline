## Test Plan:

Verify the S3 bucket is created with the correct name and ACL set to "private".
Verify the SQS queue is created with the correct name.
Verify the DynamoDB table is created with the correct name, hash key, attributes, and global secondary index.
Verify the IAM user is created with the correct name and tags.
Verify the IAM role is created with the correct name, assume role policy, and tags.
Verify the IAM role policy attachments are created with the correct policy ARNs and role names.
Verify the Lambda function is created with the correct filename, function name, role, handler, runtime, and timeout.
Verify the Lambda function environment variables are set correctly.
Verify the S3 bucket object is created with the correct key and source.

## Test Cases:

### S3 Bucket:
a. Verify the S3 bucket "lambda-ingress-bucket" is created.
b. Verify the S3 bucket ACL is set to "private".

### SQS Queue:
a. Verify the SQS queue "output-queue" is created.

### DynamoDB Table:
a. Verify the DynamoDB table "processed_data" is created.
b. Verify the DynamoDB table billing mode is set to "PAY_PER_REQUEST".
c. Verify the DynamoDB table hash key is set to "customer_reference".
d. Verify the DynamoDB table attributes "customer_reference" and "order_reference" are created.
e. Verify the DynamoDB table global secondary index "customer_orders" is created.
f. Verify the DynamoDB table global secondary index hash key is set to "customer_reference".
g. Verify the DynamoDB table global secondary index range key is set to "order_reference".
h. Verify the DynamoDB table global secondary index projection type is set to "ALL".
i. Verify the DynamoDB table global secondary index write capacity is set to 1.
j. Verify the DynamoDB table global secondary index read capacity is set to 1.

### IAM User:
a. Verify the IAM user "uploader" is created.
b. Verify the IAM user tags "Name" is set to "S3 Uploader".

### IAM Role:
a. Verify the IAM role "lambda-role" is created.
b. Verify the IAM role assume role policy is set correctly.
c. Verify the IAM role tags "Name" is set to "Lambda Role".

### IAM Role Policy Attachment:
a. Verify the IAM role policy attachment "lambda_role_policy" is created.
b. Verify the IAM role policy attachment "lambda_s3_policy" is created.
c. Verify the IAM role policy attachment "lambda_sqs_policy" is created.
d. Verify the IAM role policy attachment policy ARNs are set correctly.
e. Verify the IAM role policy attachment role names are set correctly.

### Lambda Function:
a. Verify the Lambda function "processor" is created.
b. Verify the Lambda function filename is set to "lambda.zip".
c. Verify the Lambda function function name is set to "processor".
d. Verify the Lambda function role is set correctly.
e. Verify the Lambda function handler is set to "index.handler".
f. Verify the Lambda function runtime is set to "nodejs14.x".
g. Verify the Lambda function timeout is set to 60.
h. Verify the Lambda function environment variables are set correctly.

### S3 Bucket Object:
a. Verify the S3 bucket object "input.csv" is created.
b. Verify the S3 bucket object source is set correctly.