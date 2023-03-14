import {
  validateNumber,
  createHashFromKey,
  calculateTotalAmountSpentByCustomer,
} from '../src/customerDataProcessor';

describe('validateNumber', () => {
  it('should return true for valid numbers', () => {
    expect(validateNumber(42)).toBe(true);
  });

  it('should return false for non-number values', () => {
    expect(validateNumber(NaN)).toBe(false);
  });
});

describe('createHashFromKey', () => {
  it('should create a hash from a given key and message', () => {
    const key = 'some_key';
    const message = { customer_reference: 'customer123' };
    const hash = createHashFromKey(key, message);
    expect(typeof hash).toBe('string');
    expect(hash).toHaveLength(64);
  });
});

describe('calculateTotalAmountSpentByCustomer', () => {
  const customers = [
    {
      customer_reference: '123',
      first_name: 'John',
      last_name: 'Smith',
      status: 'active',
    },
    {
      customer_reference: '456',
      first_name: 'Jane',
      last_name: 'Doe',
      status: 'active',
    },
    {
      customer_reference: '789',
      first_name: 'Joe',
      last_name: 'Bloggs',
      status: 'active',
    },
  ];
  const orders = [
    {
      customer_reference: '123',
      order_status: 'complete',
      order_reference: '123-456',
      order_timestamp: '1676539508',
    },
    {
      customer_reference: '123',
      order_status: 'complete',
      order_reference: '123-789',
      order_timestamp: '1676539508',
    },
    {
      customer_reference: '456',
      order_status: 'complete',
      order_reference: '456-123',
      order_timestamp: '1676539508',
    },
    {
      customer_reference: '789',
      order_status: 'complete',
      order_reference: '789-456',
      order_timestamp: '1676539508',
    },
  ];

  const items = [
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

  const result = calculateTotalAmountSpentByCustomer(customers, orders, items);

  it('should calculate the total amount spent by each customer', () => {
    expect(result).toEqual([
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
        total_amount_spent: 50,
      },
    ]);
  });
});
