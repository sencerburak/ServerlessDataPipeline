import { getDataFromS3, getS3Data } from '../src/utils';

import { S3 } from 'aws-sdk';

jest.mock('aws-sdk', () => {
  const mockedS3 = {
    getObject: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };
  return { S3: jest.fn(() => mockedS3) };
});

describe('getS3Data', () => {
  //   it('Should fetch data from S3', async () => {
  //     const s3Mock = new S3();
  //     const getObjectPromise = Promise.resolve({
  //       Body: Buffer.from('Hello World'),
  //     });
  //     (s3Mock.getObject as jest.Mock).mockReturnValueOnce({
  //       promise: () => getObjectPromise,
  //     });

  //     const result = await getS3Data('bucket', 'key');

  //     expect(result).toEqual('Hello World');
  //     expect(s3Mock.getObject).toHaveBeenCalledTimes(1);
  //     expect(s3Mock.getObject).toHaveBeenCalledWith({
  //       Bucket: 'bucket',
  //       Key: 'key',
  //     });
  //   });

  it('Should fetch data from s3 using getDataFromS3', async () => {
    // const s3Mock = new S3();
    // const getObjectPromise = Promise.resolve({
    //   Body: Buffer.from('Hello World'),
    // });
    // (s3Mock.getObject as jest.Mock).mockReturnValueOnce({
    //   promise: () => getObjectPromise,
    // });

    const result = await getDataFromS3(
      'lambda-ingress-bucket',
      'customers_20220131.csv',
    );

    // expect(result).toEqual('Hello World');
    // expect(s3Mock.getObject).toHaveBeenCalledTimes(1);
    // expect(s3Mock.getObject).toHaveBeenCalledWith({
    //   Bucket: 'bucket',
    //   Key: 'key',
    // });
  });
});
