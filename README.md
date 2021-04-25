![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/alepaez/hyper-queue-sqs/tests/main)
![Coveralls branch](https://img.shields.io/coveralls/github/alepaez/hyper-queue-sqs/main)

# How to use it

## Install

```bash
npm install --save @aws-sdk/client-sqs
npm install --save hyperq hyperq-sqs
```

## Usage

```typescript
import { Worker, Message } from 'hyperq';
import { SQSClient } from "@aws-sdk/client-sqs";
import { SQSQueue } from 'hyperq-sqs';

const sqs = SQSClient({
  region: "us-east-1",
});

const sqsQueue = new SQSQueue(sqs, 'myqueue');

const action = async (message: Message, w: Worker): Promise<void> => {
  const msg = message.body;
  try {
    // ...do your thing
  } catch(e) {
    await message.retry(); // Message goes back to the queue instantly
  }
  await message.delete(); // Message is deleted forever
};

const start: () => void = async () => {
  const worker = new Worker(sqsQueue, action, {});;
  await sqsQueue.build(); // This will create the queue on AWS

  const exit = () => {
    worker.exit();
    console.log('Exiting...');
  }

  process.on('SIGTERM', exit);
  process.on('SIGINT', exit);

  console.log('Running...')
  await worker.run();
  process.exit(0);
};

start();
```

