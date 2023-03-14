import { sendSQSMessage } from '../src/sqsHelper';

const SQSMock = {
  sendMessage: jest.fn().mockImplementation(() => {
    return {
      promise: jest.fn().mockResolvedValue({ MessageId: 'test-message-id' }),
    };
  }),
};

jest.mock('aws-sdk', () => {
  return {
    SQS: jest.fn(() => SQSMock),
  };
});

describe('sendSQSMessage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send a message to SQS', async () => {
    const message = {
      type: 'test_message',
      content: 'This is a test message',
    };

    // Mock console.log to capture the output
    console.log = jest.fn();

    await sendSQSMessage(message);

    expect(console.log).toHaveBeenCalledWith(
      'Sending message to SQS',
      JSON.stringify(message),
    );
    expect(SQSMock.sendMessage).toHaveBeenCalledWith({
      MessageBody: JSON.stringify(message),
      QueueUrl: 'https://sqs.eu-west-2.amazonaws.com/264231384781/output-queue',
    });
  });
});
