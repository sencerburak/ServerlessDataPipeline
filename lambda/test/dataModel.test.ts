import { recordTypes } from '../src/dataModel';

describe('recordTypes', () => {
  it('should have 3 record types', () => {
    expect(recordTypes.length).toBe(3);
  });

  it('should have the correct key prefixes for each record type', () => {
    expect(recordTypes[0].keyPrefix).toBe('customers_');
    expect(recordTypes[1].keyPrefix).toBe('orders_');
    expect(recordTypes[2].keyPrefix).toBe('items_');
  });

  it('should have the correct type for each record type', () => {
    expect(recordTypes[0].type).toBe('customers');
    expect(recordTypes[1].type).toBe('orders');
    expect(recordTypes[2].type).toBe('items');
  });

  it('should have the correct fields for each record type', () => {
    expect(Object.keys(recordTypes[0].fields)).toEqual([
      'first_name',
      'last_name',
      'customer_reference',
      'status',
    ]);
    expect(Object.keys(recordTypes[1].fields)).toEqual([
      'customer_reference',
      'order_status',
      'order_reference',
      'order_timestamp',
    ]);
    expect(Object.keys(recordTypes[2].fields)).toEqual([
      'order_reference',
      'item_name',
      'quantity',
      'total_price',
    ]);
  });
});
