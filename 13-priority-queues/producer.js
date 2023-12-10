import amqp from "amqplib";

const MAX_PRIORITY = 255;

async function assertQueue(ch) {
  const queueName = "q.priority.queue";
  const queueOptions = {
    durable: true,
    arguments: {
      "x-max-priority": MAX_PRIORITY,
    },
  };
  await ch.assertQueue(queueName, queueOptions);
  await ch.prefetch(1); // Limit each consumer to one message at a time
  return queueName;
}

async function produceMessages(ch, queue, msg) {
  const message = msg.toString();
  const messageOptions = { persistent: true, priority: msg };
  await ch.sendToQueue(queue, Buffer.from(message), messageOptions);
  console.log(`[Producer] Sent: ${message}`);
}

amqp
  .connect("amqp://localhost:5672")
  .then(function (conn) {
    let ok = conn.createChannel();
    ok = ok.then(async function (ch) {
      const queue = await assertQueue(ch);
      for (let i = 0; i < MAX_PRIORITY * 3; ++i)
        await produceMessages(ch, queue, i % MAX_PRIORITY);
    });
    return ok;
  })
  .then(null, console.warn);
