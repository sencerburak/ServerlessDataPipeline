import { SQS } from 'aws-sdk';
import { sqsQueueUrl, region } from '../config';

/**
 * Sends a message to an SQS queue.
 * @param message - Message object to send to the queue
 */
export async function sendSQSMessage(message: any) {
  console.log('Sending message to SQS', JSON.stringify(message));

  const sqs = new SQS({ apiVersion: '2012-11-05', region: region });
  const queueUrl = process.env.SQS_QUEUE_URL ?? sqsQueueUrl;
  const params: SQS.SendMessageRequest = {
    MessageBody: JSON.stringify(message),
    QueueUrl: queueUrl,
  };
  await sqs.sendMessage(params).promise();
}
