import { SQSClient, CreateQueueCommand, SendMessageCommand, ReceiveMessageCommand } from "@aws-sdk/client-sqs";
import { Queue, Message } from 'hyperq';

export default class SQSQueue implements Queue {
  private sqs: SQSClient;
  private QueueName: string;
  public QueueUrl: string;

  constructor(sqs: SQSClient, QueueName: string) {
    this.sqs = sqs;
    this.QueueName = QueueName;
    this.QueueUrl = '';
  }

  public async build(): Promise<void> {
    const { QueueUrl } = await this.sqs.send(new CreateQueueCommand({
      QueueName: this.QueueName,
    }));
    if (!QueueUrl) throw new Error("Could not create queue");
    this.QueueUrl = QueueUrl;
  }

  public async push(msgData: string): Promise<void> {
    await this.sqs.send(new SendMessageCommand({
      QueueUrl: this.QueueUrl,
      MessageBody: msgData,
    }));
  }

  public async pop(): Promise<Message | undefined> {
    const { Messages } = await this.sqs.send(new ReceiveMessageCommand({
      QueueUrl: this.QueueUrl
    }));

    const body = Messages?.[0]?.Body;

    if (!body) return;

    return {
      body,
      retry: async () => { return true; },
      delete: async () => { return true; },
    };
  }
};

