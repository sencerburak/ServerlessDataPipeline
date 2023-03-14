import { S3Handler } from 'aws-lambda';
import { handler } from '../index';
import * as s3Helper from '../src/s3Helper';
import * as customerDataProcessor from '../src/customerDataProcessor';
import createMockContext from 'aws-lambda-mock-context';

jest.mock('../src/s3Helper');
jest.mock('../src/customerDataProcessor');

const mockAllRequiredFilesExist = s3Helper.allRequiredFilesExist as jest.Mock;
const mockFetchAndParseCsvDataFromS3 =
  s3Helper.fetchAndParseCsvDataFromS3 as jest.Mock;
const mockCalculateTotalAmountSpentByCustomer =
  customerDataProcessor.calculateTotalAmountSpentByCustomer as jest.Mock;
const mockProcessAndSendMessages =
  customerDataProcessor.processAndSendMessages as jest.Mock;

describe('handler', () => {
  const s3Event = {
    Records: [
      {
        s3: {
          bucket: {
            name: 'test-bucket',
          },
          object: {
            key: 'test-key',
          },
        },
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process and send customer data messages', async () => {
    mockAllRequiredFilesExist.mockResolvedValue(true);
    mockFetchAndParseCsvDataFromS3.mockResolvedValue({
      customers: [],
      orders: [],
      items: [],
    });
    mockCalculateTotalAmountSpentByCustomer.mockReturnValue([]);
    mockProcessAndSendMessages.mockResolvedValue(undefined);

    const context = createMockContext();

    await handler(s3Event as any, context, () => {});

    expect(mockAllRequiredFilesExist).toHaveBeenCalledTimes(1);
    expect(mockFetchAndParseCsvDataFromS3).toHaveBeenCalledTimes(1);
    expect(mockCalculateTotalAmountSpentByCustomer).toHaveBeenCalledTimes(1);
    expect(mockProcessAndSendMessages).toHaveBeenCalledTimes(1);
  });
});
