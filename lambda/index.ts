console.log('Loading function');

import { S3 } from 'aws-sdk';
import {
  calculateTotalAmountSpentByCustomer,
  getDataFromS3,
  checkIfFilesExist,
  sendMessages,
} from './src/utils';

const s3 = new S3({ apiVersion: '2006-03-01', region: 'eu-west-2' });
interface HandlerOptions {
  s3?: S3;
}
export const handler = async (
  event: any,
  context: any,
  options: HandlerOptions = {},
): Promise<void> => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, ' '),
  );
  if (!checkIfFilesExist(bucket, key)) {
    return;
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const { customers, orders, items } = await getDataFromS3(bucket, key);

    const messages = calculateTotalAmountSpentByCustomer(
      customers,
      orders,
      items,
    );
    sendMessages(key, messages);
  } catch (err) {
    console.error(err);
  }
};
