import { Customer, Item, Order, recordTypes, ParsedData } from './interfaces';
import { S3, SQS, DynamoDB } from 'aws-sdk';
import { type } from 'os';
import Papa from 'papaparse';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { createHash } from 'crypto';

// Helper function: checks if a given input is a valid number
export function validateNumber(num: number): boolean {
  return typeof num === 'number' && !isNaN(num);
}

export async function getS3Data(bucket: string, key: string): Promise<string> {
  const s3 = new S3({ apiVersion: '2006-03-01', region: 'eu-west-2' });
  const params = {
    Bucket: bucket,
    Key: key,
  };
  return s3
    .getObject(params)
    .promise()
    .then((data) => {
      return data.Body?.toString() ?? '';
    });
}

// create hash from the key to be used as the partition key
export function createHashFromKey(key: string, message: any): string {
  const identifier = `${key.split('_')[1].split('.')[0]}_${message.customer_reference
    }`;
  const hash = createHash('sha256').update(identifier).digest('hex').toString();
  return hash;
}

// Check if all required files exist in the bucket
export async function checkIfFilesExist(
  bucket: string,
  key: string,
): Promise<boolean> {
  const s3 = new S3({ apiVersion: '2006-03-01', region: 'eu-west-2' });
  const customerKey = `customers_${key.split('_')[1]}`;
  const orderKey = `orders_${key.split('_')[1]}`;
  const itemKey = `items_${key.split('_')[1]}`;
  const { Contents } = await s3.listObjectsV2({ Bucket: bucket }).promise();
  const files = Contents?.map((content) => content.Key);
  if (
    !files?.includes(customerKey) ||
    !files.includes(orderKey) ||
    !files.includes(itemKey)
  ) {
    console.log(`Some of the required CSV files are missing.`);
    return false;
  }
  return true;
}

// check if message exists  then sendsqsmesssage and put to db if it doesnt for each message
export async function sendMessages(
  key: string,
  messages: any[],
): Promise<void> {
  messages.forEach(async (message) => {
    const hash = createHashFromKey(key, message);

    if (!(await messageExists(hash))) {
      sendSQSMessage(message);
      await putToDB(message, hash);
      console.log('Message sent to SQS');
    } else {
      console.log('Message already processed');
    }
  });
}

// Check if the message has already been processed by checking the dynamodb before sending it to SQS
export async function messageExists(hash: string): Promise<boolean> {
  const dynamodb = new DynamoDB({
    apiVersion: '2012-08-10',
    region: 'eu-west-2',
  });
  const params = {
    TableName: 'processed_data',
    Key: {
      hash: { S: hash },
    },
  };

  try {
    const data = await dynamodb.getItem(params).promise();
    const item = data.Item;
    if (item) {
      console.log('Item exists:', item);
      return true;
    } else {
      console.log('Item does not exist');
      return false;
    }
  } catch (error) {
    console.error('Error retrieving item from DynamoDB', error);
    throw error;
  }
}

export function calculateTotalAmountSpentByCustomer(
  customers: Customer[],
  orders: Order[],
  items: Item[],
) {
  return customers.map((customer: Customer) => {
    const matchingOrders = orders.filter(
      (order) => order.customer_reference === customer.customer_reference,
    );
    let totalAmountSpent: number = 0;
    matchingOrders.forEach((order) => {
      const matchingItems = items.filter(
        (item) => item.order_reference === order.order_reference,
      );
      matchingItems.forEach((item) => {
        totalAmountSpent =
          totalAmountSpent + parseFloat(item.total_price.toString());
      });
    });
    const message = {
      type: 'customer_message',
      customer_reference: customer.customer_reference,
      number_of_orders: matchingOrders.length,
      total_amount_spent: totalAmountSpent,
    };
    return message;
  });
}

export function sendSQSMessage(message: any) {
  const sqs = new SQS({ apiVersion: '2012-11-05', region: 'eu-west-2' });
  const queueUrl =
    process.env.SQS_QUEUE_URL ??
    'https://sqs.eu-west-2.amazonaws.com/264231384781/output-queue';
  const params: SQS.SendMessageRequest = {
    MessageBody: JSON.stringify(message),
    QueueUrl: queueUrl,
  };
  console.log('Sendihiiihihihihihing message', JSON.stringify(message));
  sqs.sendMessage(params).promise();
}

export async function putToDB(message: any, identifier: string) {
  console.log('Putting to DB', JSON.stringify(message));
  const dynamoDB = new DynamoDB({
    apiVersion: '2012-08-10',
    region: 'eu-west-2',
  });
  const docClient = new DocumentClient({ service: dynamoDB });
  const params: DocumentClient.PutItemInput = {
    TableName: 'processed_data',
    Item: {
      hash: identifier.toString(),
      customer_reference: message.customer_reference.toString(),
      number_of_orders: message.number_of_orders.toString(),
      total_amount_spent: message.total_amount_spent.toString(),
    },
  };
  try {
    const result = await docClient.put(params).promise();
    console.log('DB put operation succeeded', JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('DB put operation failed', error);
    throw error;
  }
}



export async function getDataFromS3(
  bucket: string,
  key: string,
): Promise<ParsedData> {
  try {
    const s3 = new S3({ apiVersion: '2006-03-01', region: 'eu-west-2' });

    const dataPromises = recordTypes.map(async ({ keyPrefix, fields }) => {
      const recordData = await s3
        .getObject({ Bucket: bucket, Key: keyPrefix + key.split('_')[1] })
        .promise();

      const recordCsvContent: string = (recordData.Body ?? '').toString(
        'utf-8',
      );
      return Papa.parse(recordCsvContent)
        .data.slice(1)
        .map((row: any) => {
          const record: any = {
            type: type,
          };
          fields.forEach((field, index) => {
            record[field] = row[index + 1];
            if (field === 'quantity')
              record[field] = parseInt(record[field], 10);
            if (field === 'total_price')
              record[field] = parseFloat(record[field]);
          });
          return record;
        });
    });

    const [customers, orders, items] = await Promise.all(dataPromises);

    return { customers, orders, items };
  } catch (error) {
    console.log('Error retrieving data from S3:', error);
    throw error;
  }
}
