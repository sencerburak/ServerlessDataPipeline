import { Customer, Order, Item } from '../src/interfaces';
import { calculateTotalAmountSpentByCustomer } from '../src/utils';

const customers: Customer[] = [
  {
    first_name: 'John',
    last_name: 'Smith',
    customer_reference: '123',
    status: 'active',
  },
  {
    first_name: 'Jane',
    last_name: 'Doe',
    customer_reference: '456',
    status: 'active',
  },
  {
    first_name: 'Joe',
    last_name: 'Bloggs',
    customer_reference: '789',
    status: 'active',
  },
];

const orders: Order[] = [
  {
    customer_reference: '123',
    order_status: 'complete',
    order_reference: '123-456',
    order_timestamp: '2020-01-01 12:00:00',
  },
  {
    customer_reference: '123',
    order_status: 'complete',
    order_reference: '123-789',
    order_timestamp: '2020-01-01 12:00:00',
  },
  {
    customer_reference: '456',
    order_status: 'complete',
    order_reference: '456-123',
    order_timestamp: '2020-01-01 12:00:00',
  },
  {
    customer_reference: '789',
    order_status: 'complete',
    order_reference: '789-456',
    order_timestamp: '2020-01-01 12:00:00',
  },
];

const items: Item[] = [
  {
    order_reference: '123-456',
    item_name: 'Item 1',
    quantity: 1,
    total_price: 12.3,
  },
  {
    order_reference: '123-456',
    item_name: 'Item 2',
    quantity: 1,
    total_price: 20.0,
  },
  {
    order_reference: '123-789',
    item_name: 'Item 3',
    quantity: 1,
    total_price: 30.0,
  },
  {
    order_reference: '456-123',
    item_name: 'Item 4',
    quantity: 1,
    total_price: 40.0,
  },
  {
    order_reference: '789-456',
    item_name: 'Item 5',
    quantity: 1,
    total_price: 50.0,
  },
];

const expectedResults = [
  {
    type: 'customer_message',
    customer_reference: '123',
    number_of_orders: 2,
    total_amount_spent: 62.3,
  },
  {
    type: 'customer_message',
    customer_reference: '456',
    number_of_orders: 1,
    total_amount_spent: 40,
  },
  {
    type: 'customer_message',
    customer_reference: '789',
    number_of_orders: 1,
    total_amount_spent: 50.0,
  },
];

test('calculateTotalAmountSpentByCustomer', () => {
  const results = calculateTotalAmountSpentByCustomer(customers, orders, items);
  console.log('--------------------');
  console.log('--------------------');
  console.log(results);
  console.log('$$$$$$$$$$$$$$$$$$$$$');
  console.log(expectedResults);
  console.log('--------------------');
  console.log('--------------------');
  expect(results).toHaveLength(3);

  expect(results).toEqual(expectedResults);
});

// test('should send a message to SQS for each customer', async () => {
//   const messages = calculateTotalAmountSpentByCustomer(
//     customers,
//     orders,
//     items,
//   );
//   for (const message of messages) {
//     await sendSQSMessage(message);
//   }
// });
