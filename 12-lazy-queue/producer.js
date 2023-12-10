import amqp from "amqplib";

const messageCount = 100000;

async function assertQueue(ch) {
  const queueName = "q.queue";
  const queueOptions = { durable: true, autoDelete: true };
  await ch.assertQueue(queueName, queueOptions);
  await ch.prefetch(1); // Limit each consumer to one message at a time
  return queueName;
}

async function assertQueueLazy(ch) {
  const queueName = "q.lazy.queue";
  // Policies can be used to make a queue lazy
  const queueOptions = {
    durable: true,
    autoDelete: true,
    arguments: {
      "x-queue-mode": "lazy",
    },
  };
  await ch.assertQueue(queueName, queueOptions);
  await ch.prefetch(1); // Limit each consumer to one message at a time
  return queueName;
}

async function produceMessages(ch, queue) {
  const messageOptions = { persistent: true };
  const message = `Message: ${new Date().toISOString()}`;
  for (let i = 0; i < messageCount; ++i) {
    await ch.sendToQueue(queue, Buffer.from(message), messageOptions);
  }
  console.log("[Producer] Messages sent individually");
}

amqp
  .connect("amqp://localhost:5672")
  .then(function (conn) {
    let ok = conn.createChannel();
    ok = ok.then(async function (ch) {
      const queue = await assertQueue(ch);
      await produceMessages(ch, queue);
      const lazyQueue = await assertQueueLazy(ch);
      await produceMessages(ch, lazyQueue);
    });
    return ok;
  })
  .then(null, console.warn);
