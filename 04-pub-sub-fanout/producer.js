import amqp from "amqplib";

async function assertExchange(ch) {
  const exchangeName = "ex.application.events";
  const exchangeOptions = { durable: false };
  await ch.assertExchange(exchangeName, "fanout", exchangeOptions);
  return exchangeName;
}

let count = 0;
async function assertQueue(ch) {
  count++;
  const queueName = "q.application.events.client" + count.toString();
  const queueOptions = { durable: true };
  await ch.assertQueue(queueName, queueOptions);
  await ch.prefetch(1); // Limit each consumer to one message at a time
  return queueName;
}

async function produceMessages(ch, exchange) {
  const message = `Message: ${new Date().toISOString()}`;
  await ch.publish(exchange, "", Buffer.from(message));
  console.log(`[Producer] Published: ${message}`);
}

amqp
  .connect("amqp://localhost:5672")
  .then(function (conn) {
    let ok = conn.createChannel();
    ok = ok.then(async function (ch) {
      const exchange = await assertExchange(ch);
      const queue1 = await assertQueue(ch);
      ch.bindQueue(queue1, exchange, "");
      const queue2 = await assertQueue(ch);
      ch.bindQueue(queue2, exchange, "");
      setInterval(async () => {
        await produceMessages(ch, exchange);
      }, 1000);
    });
    return ok;
  })
  .then(null, console.warn);
