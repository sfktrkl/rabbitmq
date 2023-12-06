import amqp from "amqplib";

async function assertExchange(ch) {
  const exchangeName = "ex.application.events";
  const exchangeOptions = { durable: false };
  await ch.assertExchange(exchangeName, "direct", exchangeOptions);
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
      ch.bindQueue(queue1, exchange, "sport");
      const queue2 = await assertQueue(ch);
      ch.bindQueue(queue2, exchange, "sport");
      ch.bindQueue(queue2, exchange, "weather");
      setInterval(async () => {
        await produceMessages(ch, "sport", exchange);
        await produceMessages(ch, "weather", exchange);
      }, 1000);
    });
    return ok;
  })
  .then(null, console.warn);
