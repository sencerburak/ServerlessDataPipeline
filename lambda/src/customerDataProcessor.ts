import { Customer, Item, Order, ParsedData } from './dataModel';
import { createHash } from 'crypto';
import { putMessageToDB, checkMessageExistence } from './dynamoDBHelper';
import { sendSQSMessage } from './sqsHelper';

/**
 * Validates if a given input is a valid number.
 * @param num - The number to validate
 * @returns {boolean} - True if the input is a valid number, otherwise false
 */
export function validateNumber(num: number): boolean {
  return typeof num === 'number' && !isNaN(num);
}

/**
 * Creates a hash from a key to be used as the partition key.
 * @param key - The key to create a hash from
 * @param message - The message object containing customer reference
 * @returns {string} - The created hash
 */
export function createHashFromKey(key: string, message: any): string {
  console.log('Creating hash from key');
  const identifier = `${key.split('_')[1].split('.')[0]}_${
    message.customer_reference
  }`;
  const hash = createHash('sha256').update(identifier).digest('hex').toString();
  return hash;
}

/**
 * Processes and sends messages to SQS after checking if they have already been processed.
 * @param key - The key to create a hash from
 * @param messages - An array of messages to process and send
 */
export async function processAndSendMessages(
  key: string,
  messages: any[],
): Promise<void> {
  console.log(
    'Checking if messages have already been processed and sending to SQS',
  );
  for (const message of messages) {
    const hash = createHashFromKey(key, message);

    try {
      const exists = await checkMessageExistence(hash);
      if (exists) {
        console.log(`Message with hash ${hash} already exists`);
      } else {
        await sendSQSMessage(message);
        await putMessageToDB(message, hash);
        console.log('Message sent to SQS');
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }
}

/**
 * Calculates the total amount spent by each customer.
 * @param customers - An array of Customer objects
 * @param orders - An array of Order objects
 * @param items - An array of Item objects
 * @returns {any[]} - An array of messages containing customer data
 */
export function calculateTotalAmountSpentByCustomer(
  customers: Customer[],
  orders: Order[],
  items: Item[],
): any[] {
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
        totalAmountSpent += parseFloat(item.total_price.toString());
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

/**
 * Waits for a specified number of milliseconds and displays a countdown.
 * @param milliseconds - The number of milliseconds to wait
 */
export async function waitAndCountdown(milliseconds: number) {
  console.log(`Waiting for ${milliseconds / 1000} seconds...`);
  const endTime = Date.now() + milliseconds;
  while (Date.now() < endTime) {
    const remainingTime = Math.ceil((endTime - Date.now()) / 1000);
    console.log(`Countdown: ${remainingTime} seconds`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  console.log('Done!');
}
