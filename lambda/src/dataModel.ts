/**
 * Represents a customer in the data model.
 */
export interface Customer {
  first_name: string;
  last_name: string;
  customer_reference: string;
  status: string;
}

/**
 * Represents an order in the data model.
 */
export interface Order {
  customer_reference: string;
  order_status: string;
  order_reference: string;
  order_timestamp: string;
}

/**
 * Represents an item in the data model.
 */
export interface Item {
  order_reference: string;
  item_name: string;
  quantity: number;
  total_price: number;
}

/**
 * Represents the parsed data structure containing arrays of customers, orders, and items.
 */
export interface ParsedData {
  customers: Customer[];
  orders: Order[];
  items: Item[];
}

export type RecordType = 'customers' | 'orders' | 'items';

export type RecordFields<T> = {
  [K in keyof T]: K;
};

const customerFields: RecordFields<Customer> = {
  first_name: 'first_name',
  last_name: 'last_name',
  customer_reference: 'customer_reference',
  status: 'status',
};

const orderFields: RecordFields<Order> = {
  customer_reference: 'customer_reference',
  order_status: 'order_status',
  order_reference: 'order_reference',
  order_timestamp: 'order_timestamp',
};

const itemFields: RecordFields<Item> = {
  order_reference: 'order_reference',
  item_name: 'item_name',
  quantity: 'quantity',
  total_price: 'total_price',
};

/**
 * An array of record type objects, each with a key prefix, fields, and type.
 */
export const recordTypes = [
  {
    keyPrefix: 'customers_',
    fields: customerFields,
    type: 'customers' as RecordType,
  },
  {
    keyPrefix: 'orders_',
    fields: orderFields,
    type: 'orders' as RecordType,
  },
  {
    keyPrefix: 'items_',
    fields: itemFields,
    type: 'items' as RecordType,
  },
];
