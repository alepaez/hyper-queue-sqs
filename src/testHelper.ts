import { SQSClient, ListQueuesCommand, DeleteQueueCommand } from "@aws-sdk/client-sqs";

const createSQSConnection = (): SQSClient => {
  return new SQSClient({
    region: "us-east-1",
    endpoint: 'http://localhost:4566',
  });
};

beforeEach(async () => {
  const sqs = createSQSConnection();
  const { QueueUrls } = await sqs.send(new ListQueuesCommand({}));
  if (!QueueUrls) return;
  await Promise.all(QueueUrls.map(
    async (QueueUrl) => sqs.send(new DeleteQueueCommand({ QueueUrl }))
  ));
});

export {
  createSQSConnection,
}
