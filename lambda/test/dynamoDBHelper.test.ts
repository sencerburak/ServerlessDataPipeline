import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { putMessageToDB, checkMessageExistence } from '../src/dynamoDBHelper';

jest.mock('aws-sdk/clients/dynamodb', () => {
  const putMock = jest.fn().mockImplementation(() => {
    return {
      promise: jest.fn().mockResolvedValue({}),
    };
  });

  const getMock = jest.fn().mockImplementation(() => {
    return {
      promise: jest.fn().mockResolvedValue({ Item: null }),
    };
  });

  return {
    DocumentClient: jest.fn(() => {
      return { put: putMock, get: getMock };
    }),
    putMock,
    getMock,
  };
});

const { putMock, getMock } = require('aws-sdk/clients/dynamodb');

describe('putMessageToDB', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should put a message to the DynamoDB table', async () => {
    const message = {
      customer_reference: 'CUST_01',
      number_of_orders: '3',
      total_amount_spent: '150.00',
    };
    const identifier = 'test-identifier';

    await putMessageToDB(message, identifier);

    expect(putMock).toHaveBeenCalled();
  });
});

describe('checkMessageExistence', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should check if a message with the specified hash exists', async () => {
    const hash = 'test-hash';
    const result = await checkMessageExistence(hash);

    expect(getMock).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should return true if a message with the specified hash exists', async () => {
    getMock.mockImplementationOnce(() => {
      return {
        promise: jest.fn().mockResolvedValue({
          Item: {
            hash: 'test-hash',
            customer_reference: 'CUST_01',
            number_of_orders: '3',
            total_amount_spent: '150.00',
          },
        }),
      };
    });

    const hash = 'test-hash';
    const result = await checkMessageExistence(hash);

    expect(getMock).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
