import amqp from "amqplib";

async function assertExchange(ch) {
  const exchangeName = "ex.hash";
  const exchangeOptions = { durable: false };
  await ch.assertExchange(exchangeName, "x-consistent-hash", exchangeOptions);
  return exchangeName;
}

let count = 0;
async function assertQueue(ch) {
  count++;
  const queueName = "q.messages" + count.toString();
  const queueOptions = { durable: true };
  await ch.assertQueue(queueName, queueOptions);
  await ch.prefetch(1); // Limit each consumer to one message at a time
  return queueName;
}

async function produceMessages(ch, route, exchange) {
  const message = `Message: ${new Date().toISOString()}`;
  await ch.publish(exchange, route, Buffer.from(message));
  console.log(`[Producer ${route}] Published: ${message}`);
}

amqp
  .connect("amqp://localhost:5672")
  .then(function (conn) {
    let ok = conn.createChannel();
    ok = ok.then(async function (ch) {
      const exchange = await assertExchange(ch);
      const queue1 = await assertQueue(ch);
      ch.bindQueue(queue1, exchange, "1");
      const queue2 = await assertQueue(ch);
      ch.bindQueue(queue2, exchange, "3");
      setInterval(async () => {
        await produceMessages(
          ch,
          Math.ceil(Math.random() * 1e5).toString(),
          exchange
        );
        await produceMessages(
          ch,
          Math.ceil(Math.random() * 1e5).toString(),
          exchange
        );
      }, 10);
    });
    return ok;
  })
  .then(null, console.warn);
