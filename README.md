# How to use it

## Install

```bash
npm install --save @aws-sdk/client-sqs
npm install --save hyperq hyperq-sqs
```

## Usage

```typescript
const { Worker, Message } = require('hyperq');
const { SQSClient } = require("@aws-sdk/client-sqs")
const { SQSQueue } = require('hyperq-sqs');

const sqs = SQSClient({
  region: "us-east-1",
})

const sqsQueue = new SQSQueue(sqs, 'myqueue');
await sqsQueue.build(); // This will create the queue on AWS

const action = async (message: Message, w: Worker): Promise<void> => {
  const msg = message.body;
  try {
    // ...do your thing
  } catch(e) {
    await message.retry(); // Message goes back to the queue instantly
  }
  await message.delete(); // Message is deleted forever
};

const worker = new Worker(sqsQueue, action, {});;

process.on('SIGTERM', worker.exit());
process.on('SIGINT', worker.exit());

await worker.run();
```

