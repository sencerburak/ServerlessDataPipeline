export interface Customer {
  first_name: string;
  last_name: string;
  customer_reference: string;
  status: string;
}
export interface Order {
  customer_reference: string;
  order_status: string;
  order_reference: string;
  order_timestamp: string;
}

export interface Item {
  order_reference: string;
  item_name: string;
  quantity: number;
  total_price: number;
}

interface ParsedData {
  customers: Customer[];
  orders: Order[];
  items: Item[];
}

export const recordTypes = [
  {
    keyPrefix: 'customers_',
    fields: ['first_name', 'last_name', 'customer_reference', 'status'],
    type: 'customers',
  },
  {
    keyPrefix: 'orders_',
    fields: [
      'customer_reference',
      'order_status',
      'order_reference',
      'order_timestamp',
    ],
    type: 'orders',
  },
  {
    keyPrefix: 'items_',
    fields: ['order_reference', 'item_name', 'quantity', 'total_price'],
    type: 'items',
  },
];
