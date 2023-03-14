import Papa from 'papaparse';
import {
  fetchAndParseCsvDataFromS3,
  allRequiredFilesExist,
} from '../src/s3Helper';

const S3Mock = {
  getObject: jest.fn().mockImplementation(() => {
    return {
      promise: jest.fn().mockResolvedValue({ Body: 'test-csv-content' }),
    };
  }),
  listObjectsV2: jest.fn().mockImplementation(() => {
    return {
      promise: jest.fn().mockResolvedValue({
        Contents: [
          { Key: 'customers_test.csv' },
          { Key: 'orders_test.csv' },
          { Key: 'items_test.csv' },
        ],
      }),
    };
  }),
};

jest.mock('aws-sdk', () => {
  return {
    S3: jest.fn(() => S3Mock),
  };
});

jest.mock('papaparse', () => {
  return {
    parse: jest.fn().mockReturnValue({
      data: [
        ['id', 'customer_reference'],
        ['1', 'CUST_01'],
      ],
    }),
  };
});

describe('fetchAndParseCsvDataFromS3', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and parse CSV data from S3', async () => {
    const bucket = 'test-bucket';
    const key = 'test_key.csv';
    const result = await fetchAndParseCsvDataFromS3(bucket, key);

    expect(S3Mock.getObject).toHaveBeenCalledTimes(3);
    expect(Papa.parse).toHaveBeenCalledTimes(3);
    expect(result).toHaveProperty('customers');
    expect(result).toHaveProperty('orders');
    expect(result).toHaveProperty('items');
  });
});

describe('allRequiredFilesExist', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should check if all required files exist', async () => {
    const bucket = 'test-bucket';
    const key = 'customer_test.csv';
    const result = await allRequiredFilesExist(bucket, key);

    expect(S3Mock.listObjectsV2).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should return false if some required files are missing', async () => {
    S3Mock.listObjectsV2.mockImplementationOnce(() => {
      return {
        promise: jest.fn().mockResolvedValue({
          Contents: [{ Key: 'customers_test.csv' }, { Key: 'orders_test.csv' }],
        }),
      };
    });

    const bucket = 'test-bucket';
    const key = 'test_key.csv';
    const result = await allRequiredFilesExist(bucket, key);

    expect(S3Mock.listObjectsV2).toHaveBeenCalled();
    expect(result).toBe(false);
  });
});
