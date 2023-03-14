import { SQS } from 'aws-sdk';

/**
 * Sends a message to an SQS queue.
 * @param message - Message object to send to the queue
 */
export async function sendSQSMessage(message: any) {
  console.log('Sending message to SQS', JSON.stringify(message));

  const sqs = new SQS({ apiVersion: '2012-11-05', region: 'eu-west-2' });
  const queueUrl =
    process.env.SQS_QUEUE_URL ??
    'https://sqs.eu-west-2.amazonaws.com/264231384781/output-queue';
  const params: SQS.SendMessageRequest = {
    MessageBody: JSON.stringify(message),
    QueueUrl: queueUrl,
  };
  await sqs.sendMessage(params).promise();
}
