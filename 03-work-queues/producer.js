import amqp from "amqplib";

async function assertQueue(ch) {
  const queueName = "q.application.events";
  const queueOptions = { durable: true };
  await ch.assertQueue(queueName, queueOptions);
  await ch.prefetch(1); // Limit each consumer to one message at a time
  return queueName;
}

async function produceMessages(ch, queue) {
  const messageOptions = { persistent: true };
  const message = `Message: ${new Date().toISOString()}`;
  await ch.sendToQueue(queue, Buffer.from(message), messageOptions);
  console.log(`[Producer] Sent: ${message}`);
}

amqp
  .connect("amqp://localhost:5672")
  .then(function (conn) {
    let ok = conn.createChannel();
    ok = ok.then(async function (ch) {
      const queue = await assertQueue(ch);
      setInterval(async () => {
        await produceMessages(ch, queue);
      }, 1000);
    });
    return ok;
  })
  .then(null, console.warn);
