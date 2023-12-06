import amqp from "amqplib";

async function assertExchange(ch) {
  const exchangeName = "ex.application.events";
  const exchangeOptions = { durable: false };
  await ch.assertExchange(exchangeName, "headers", exchangeOptions);
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

async function produceMessages(ch, headers, exchange) {
  const message = `Message: ${new Date().toISOString()}`;
  await ch.publish(exchange, "", Buffer.from(message), { headers });
  console.log(`[Producer ${JSON.stringify(headers)}] Published: ${message}`);
}

amqp
  .connect("amqp://localhost:5672")
  .then(function (conn) {
    let ok = conn.createChannel();
    ok = ok.then(async function (ch) {
      const exchange = await assertExchange(ch);
      const queue1 = await assertQueue(ch);
      ch.bindQueue(queue1, exchange, "", {
        "x-match": "all",
        topic: "sport",
        source: "bbc",
      });
      const queue2 = await assertQueue(ch);
      ch.bindQueue(queue2, exchange, "", {
        "x-match": "any",
        topic: "weather",
        source: "cnn",
      });
      setInterval(async () => {
        await produceMessages(ch, { topic: "sport", source: "cnn" }, exchange);
        await produceMessages(ch, { topic: "sport", source: "bbc" }, exchange);
        await produceMessages(
          ch,
          { topic: "weather", source: "cnn" },
          exchange
        );
        await produceMessages(
          ch,
          { topic: "weather", source: "bbc" },
          exchange
        );
      }, 1000);
    });
    return ok;
  })
  .then(null, console.warn);
