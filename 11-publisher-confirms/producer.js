import amqp from "amqplib";

const batchSize = 100;
const messageCount = 1000;

function measureTime(fn, ...args) {
  const startTime = new Date();
  return fn(...args).then((result) => {
    const endTime = new Date();
    const timeTaken = endTime - startTime;
    console.log(`${fn.name} took ${timeTaken} milliseconds`);
    return result;
  });
}

async function assertQueue(ch) {
  const queueName = "q.transactions";
  const queueOptions = { durable: true, autoDelete: true };
  await ch.assertQueue(queueName, queueOptions);
  await ch.prefetch(1); // Limit each consumer to one message at a time
  return queueName;
}

async function produceMessagesIndividually(ch, queue, waitForConfirms) {
  const messageOptions = { persistent: true };
  const message = `Message: ${new Date().toISOString()}`;
  for (let i = 0; i < messageCount; ++i) {
    await ch.sendToQueue(queue, Buffer.from(message), messageOptions);
    if (waitForConfirms) await ch.waitForConfirms();
  }
  console.log("[Producer] Messages sent individually");
}

async function produceMessagesInBatch(ch, queue) {
  let outstandingMessageCount = 0;
  const messageOptions = { persistent: true };
  const message = `Message: ${new Date().toISOString()}`;
  for (let i = 0; i < messageCount; ++i) {
    await ch.sendToQueue(queue, Buffer.from(message), messageOptions);
    outstandingMessageCount++;
    if (outstandingMessageCount === batchSize) {
      await ch.waitForConfirms();
      outstandingMessageCount = 0;
    }
  }
  if (outstandingMessageCount > 0) {
    await ch.waitForConfirms();
  }
  console.log("[Producer] Messages sent in batch");
}

async function produceMessagesAsynchronously(ch, queue) {
  const messageOptions = { persistent: true };
  const message = `Message: ${new Date().toISOString()}`;

  const sendMessages = () => {
    return new Promise(async (resolve, reject) => {
      let outstandingMessageCount = 0;
      for (let i = 0; i < batchSize; ++i) {
        await ch.sendToQueue(queue, Buffer.from(message), messageOptions);
        outstandingMessageCount++;
        if (outstandingMessageCount === batchSize) {
          await ch.waitForConfirms();
          outstandingMessageCount = 0;
        }
      }
      if (outstandingMessageCount > 0) {
        await ch.waitForConfirms();
      }
      resolve();
    });
  };

  const promises = [];
  for (let i = 0; i < messageCount / batchSize; ++i)
    promises.push(sendMessages());
  await Promise.all(promises);

  console.log("[Producer] Messages sent asynchronously");
}

amqp
  .connect("amqp://localhost:5672")
  .then(function (conn) {
    let ok = conn.createConfirmChannel();
    ok = ok.then(async function (ch) {
      const queue = await assertQueue(ch);
      await measureTime(produceMessagesIndividually, ch, queue, false);
      await measureTime(produceMessagesIndividually, ch, queue, true);
      await measureTime(produceMessagesInBatch, ch, queue);
      await measureTime(produceMessagesAsynchronously, ch, queue);
    });
    return ok;
  })
  .then(null, console.warn);
