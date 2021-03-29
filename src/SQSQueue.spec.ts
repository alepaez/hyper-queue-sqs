import { ListQueuesCommand, ReceiveMessageCommand, GetQueueAttributesCommand } from "@aws-sdk/client-sqs";
import SQSQueue from './SQSQueue';

import { createSQSConnection } from './testHelper';

test('build creates queue on sqs', async () => {
  const sqs = createSQSConnection();
  const sqsQueue = new SQSQueue(sqs, 'queue1');
  await sqsQueue.build();
  const data = await sqs.send(new ListQueuesCommand({}));
  expect(data.QueueUrls).toEqual(['http://localhost/000000000000/queue1']);
});

test('build find QueueUrl when it already exists', async () => {
  const sqs = createSQSConnection();
  const sqsQueue = new SQSQueue(sqs, 'queue1');
  await sqsQueue.build();
  const sqsQueue2 = new SQSQueue(sqs, 'queue1');
  await sqsQueue2.build();
  expect(sqsQueue2.QueueUrl).toEqual('http://localhost/000000000000/queue1');
});

test('build throws expection when create queue QueueUrl return is undefined', async () => {
  const sqs = createSQSConnection();
  const sendSpy = jest.spyOn(sqs, 'send').mockImplementation(async () => ({}));
  const sqsQueue = new SQSQueue(sqs, 'queue1');
  await expect(sqsQueue.build()).rejects.toThrow('Could not create queue');
});

test('push to sqs queue', async () => {
  const sqs = createSQSConnection();
  const sqsQueue = new SQSQueue(sqs, 'queue1');
  await sqsQueue.build();
  await sqsQueue.push('Hello World');
  const { Messages } = await sqs.send(new ReceiveMessageCommand({ QueueUrl: sqsQueue.QueueUrl }));
  expect(Messages?.[0]?.Body).toEqual('Hello World');
});

test('pop message from sqs queue', async () => {
  const sqs = createSQSConnection();
  const sqsQueue = new SQSQueue(sqs, 'queue1');
  await sqsQueue.build();
  await sqsQueue.push('Hello World');
  const message = await sqsQueue.pop();
  expect(message?.body).toEqual('Hello World');
});

test('pop returns undefined when there is no message', async () => {
  const sqs = createSQSConnection();
  const sqsQueue = new SQSQueue(sqs, 'queue1');
  await sqsQueue.build();
  const message = await sqsQueue.pop();
  expect(message).toEqual(undefined);
});

test('message delete function deletes message from the queue', async () => {
  const sqs = createSQSConnection();
  const sqsQueue = new SQSQueue(sqs, 'queue1');
  await sqsQueue.build();
  await sqsQueue.push('Hello World');

  const message = await sqsQueue.pop();

  await message?.delete();

  const { Attributes } = await sqs.send(new GetQueueAttributesCommand({ QueueUrl: sqsQueue.QueueUrl }));
  expect(Attributes?.ApproximateNumberOfMessagesNotVisible).toEqual('0');
});

test('message retry function free message to be executed', async () => {
  const sqs = createSQSConnection();
  const sqsQueue = new SQSQueue(sqs, 'queue1');
  await sqsQueue.build();
  await sqsQueue.push('Hello World');

  const message = await sqsQueue.pop();

  await message?.retry();

  const { Attributes } = await sqs.send(new GetQueueAttributesCommand({ QueueUrl: sqsQueue.QueueUrl }));
  expect(Attributes?.ApproximateNumberOfMessages).toEqual('1');
});

