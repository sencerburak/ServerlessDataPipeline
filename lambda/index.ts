console.log('Loading function');

import { S3Handler } from 'aws-lambda';
import {
  allRequiredFilesExist,
  fetchAndParseCsvDataFromS3,
} from './src/s3Helper';
import {
  calculateTotalAmountSpentByCustomer,
  processAndSendMessages,
  waitAndCountdown,
} from './src/customerDataProcessor';

/**
 * Lambda function handler to process and send customer data messages.
 * @param event - AWS Lambda event object
 * @param _context - AWS Lambda context object (unused)
 */
export const handler: S3Handler = async (event, _context) => {
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));
    await waitAndCountdown(5000);
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(
      event.Records[0].s3.object.key.replace(/\+/g, ' '),
    );
    if (!(await allRequiredFilesExist(bucket, key))) {
      return;
    }
    const { customers, orders, items } = await fetchAndParseCsvDataFromS3(
      bucket,
      key,
    );
    const messages = calculateTotalAmountSpentByCustomer(
      customers,
      orders,
      items,
    );
    await processAndSendMessages(key, messages);
  } catch (error) {
    console.log(error);
  }
};
