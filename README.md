# ServerlessDataPipeline

ServerlessDataPipeline is a sample project that demonstrates how to create a serverless data pipeline using AWS Lambda, S3, DynamoDB, and SQS. The project includes code for the Lambda function, as well as infrastructure code for creating the necessary resources in AWS.

## Project Structure

The `ServerlessDataPipeline` project follows the following structure:


* `lambda/index.ts`: The main entry point for the Lambda function.
* `lambda/package.json`: The package file for the Lambda function.
* `lambda/src/customerDataProcessor.ts`: Code for processing customer data.
* `lambda/src/dataModel.ts`: Code for defining the data model used in the pipeline.
* `lambda/src/dynamoDBHelper.ts`: Code for interacting with DynamoDB.
* `lambda/src/s3Helper.ts`: Code for interacting with S3.
* `lambda/src/sqsHelper.ts`: Code for interacting with SQS.
* `infra/main.tf`: The main Terraform code for creating the necessary resources in AWS.
* `infra/variables.tf`: The variables file for the Terraform code.
* `lambda/test`: Folder where unit tests for the lambda package are located
* `infra/test`: Folder where unit tests for the infra package are located


## Setup

Before using this project, you will need to set up the following prerequisites:

* AWS account
* AWS CLI
* Terraform
* Node.js and npm

## Deployment

To deploy the project, follow these steps:

1. Clone the repository: `git clone https://github.com/sencerb88/ServerlessDataPipeline.git`
2. Navigate to the `lambda` directory: `cd ServerlessDataPipeline/lambda`
3. Install the required dependencies: `npm install`
4. Test the code: `npm run test`
4. Build & create a zip file of the Lambda code: `npm run build && npm run package`
5. Initialize Terraform: `npm run tf-init`
6. Apply the Terraform code: `npm run tf-apply`

## Usage

Once the project is deployed, you can use the pipeline by uploading a CSV file to the S3 bucket created by Terraform. The Lambda function will then be triggered and will process the data, inserting it into the DynamoDB table. The SQS queue is used as a buffer to handle any spikes in traffic.

You can use more scripts located in the package.json to uplod files, purge all data from bucket, sqs and dynamoDB, and for more development tasks.


## Approach

To achieve the processing and generation of messages in a serverless setup using AWS Lambda and TypeScript with Node.js, S3, and Terraform, we can follow these steps:

- Use Terraform to create an S3 bucket with the necessary permissions for the partner to upload CSV files and enable event notifications so that Lambda can be triggered when a new file is uploaded.
- Create a Lambda function using TypeScript that listens to the S3 bucket event and retrieves the CSV file data.
- Parse the CSV files to extract the necessary data, perform any necessary validation, and generate messages in JSON format based on the example output provided.
- Use AWS SQS to send the generated messages to a message queue.
- Use AWS DynamoDB to store the processed data in permanent storage.
- Set up error handling to generate error messages and send them to the message queue.
- Use Terraform to deploy the Lambda function and necessary infrastructure in AWS, such as the SQS queue and DynamoDB table.

The Lambda function can be written in TypeScript using Node.js and the AWS SDK to interact with AWS services. The S3 bucket, SQS queue, and DynamoDB table can be created and managed using Terraform, which allows for infrastructure as code and makes it easier to deploy and manage the application in AWS.

By leveraging the power of serverless computing with AWS Lambda and Terraform, we can handle large volumes of data processing and message generation in a scalable and cost-effective manner without having to worry about managing servers.

## Solution

The problem at hand is the processing of large volumes of data in a scalable and cost-effective manner. In this case, the partner uploads 3 files to a shared S3 bucket daily, and we need to process the input, generate messages in JSON format, send them to a message queue, and store the processed data in permanent storage.

To solve this problem, we can use a serverless architecture using AWS Lambda, S3, DynamoDB, and SQS. AWS Lambda allows us to process the uploaded data in real-time without having to manage any servers. S3 can be used to store the uploaded data, and event notifications can be used to trigger the Lambda function whenever new files are uploaded. DynamoDB can be used to store the processed data, and SQS can be used to send the generated messages to a message queue.

Our solution involves creating a Lambda function that listens to the S3 bucket event, retrieves the CSV file data, parses the data to extract the necessary information, generates messages in JSON format, and sends them to the message queue using SQS. The processed data is stored in DynamoDB for future reference. The Lambda function can be written in TypeScript using Node.js, and the AWS SDK can be used to interact with AWS services.

Our solution scales well as Lambda functions can scale automatically to handle high traffic volumes without requiring any additional configuration. DynamoDB and SQS are highly scalable services that can handle large volumes of data with low latency. S3 can also handle large volumes of data and is highly available and durable.

To improve the setup, we can consider adding more error handling and retry mechanisms to handle unexpected inputs or failures. We can also use AWS Step Functions to create a workflow that can coordinate multiple Lambda functions and services to perform more complex processing tasks. Additionally, we can use AWS CloudWatch to monitor the performance and health of our serverless architecture and to set up alarms for any issues or errors that arise.

## Next Steps

- Testing and validation: Currently some initial unit tests are implemented for the Lambda function. These should be extended to cover more cases and all logical paths. Also the infra module has no tests implemented yet. After reaching the desired level of unit test coverage, imtegration tests and data validation tests should be designed.

- Error handling: Additional error handling mechanisms can be added to handle unexpected inputs or failures. For example, we can add retry logic to handle temporary errors and send error messages to the message queue when data processing fails.

- Performance optimization: We can optimize the performance of the Lambda function and other services by tuning various configuration parameters, such as timeouts and concurrency limits. We can also consider using AWS X-Ray to analyze the performance of the system and identify any bottlenecks.

- Workflow orchestration: As the complexity of the processing tasks increases, we may need to use a workflow orchestration service like AWS Step Functions to manage and coordinate the different Lambda functions and services involved in the data processing pipeline.

- Security and access management: It's important to ensure that the system is secure and that access to the AWS resources is properly managed. This can be achieved by setting up appropriate IAM roles and policies, encrypting data in transit and at rest, and setting up VPCs and security groups to control access to the resources.

- Documentation and deployment: Finally, we need to ensure that the project is properly documented and that the infrastructure and services are deployed and managed using an appropriate tool like Terraform or AWS CloudFormation. This will help to ensure that the project is maintainable and can be easily replicated in other environments or regions.