import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { dynamoDBTableName, region } from '../config';

const dynamoDBClient = new DocumentClient({
  apiVersion: '2012-08-10',
  region: region,
});

/**
 * Inserts a message into the DynamoDB table.
 *
 * @param {any} message - The message object to be inserted.
 * @param {string} identifier - The unique identifier for the message.
 * @returns {Promise<DocumentClient.PutItemOutput>} A promise that resolves with the result of the put operation.
 * @throws Will throw an error if the put operation fails.
 */
export async function putMessageToDB(message: any, identifier: string) {
  console.log('Putting message to DB', JSON.stringify(message));
  const params: DocumentClient.PutItemInput = {
    TableName: dynamoDBTableName,
    Item: {
      hash: identifier.toString(),
      customer_reference: message.customer_reference.toString(),
      number_of_orders: message.number_of_orders.toString(),
      total_amount_spent: message.total_amount_spent.toString(),
    },
  };
  try {
    const result = await dynamoDBClient.put(params).promise();
    console.log('DB put operation succeeded', JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('DB put operation failed', error);
    throw error;
  }
}

/**
 * Checks if a message with the specified hash exists in the DynamoDB table.
 *
 * @param {string} hash - The unique hash of the message to be checked.
 * @returns {Promise<boolean>} A promise that resolves with a boolean value indicating whether the message exists.
 * @throws Will throw an error if there is an issue retrieving the item from DynamoDB.
 */
export async function checkMessageExistence(hash: string): Promise<boolean> {
  console.log('Checking if message has already been processed');
  const params: DocumentClient.GetItemInput = {
    TableName: dynamoDBTableName,
    Key: {
      hash: hash,
    },
  };
  try {
    console.log('Checking if item exists in DynamoDB');
    const data = await dynamoDBClient.get(params).promise();
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
