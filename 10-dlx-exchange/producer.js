import amqp from "amqplib";

async function assertExchange(ch, exchange) {
  const exchangeOptions = { durable: false };
  await ch.assertExchange(exchange, "direct", exchangeOptions);
  return exchange;
}

async function assertQueue(ch, queue, args) {
  const queueOptions = { durable: true, arguments: args };
  await ch.assertQueue(queue, queueOptions);
  await ch.prefetch(1); // Limit each consumer to one message at a time
  return queue;
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
      const dlxExchange = await assertExchange(ch, "ex.dlx.messages");
      const dlxQueue = await assertQueue(ch, "q.dlx.messages", {});
      ch.bindQueue(dlxQueue, dlxExchange, "");
      const exchange = await assertExchange(ch, "ex.messages");
      const queue = await assertQueue(ch, "q.messages", {
        "x-dead-letter-exchange": "ex.dlx.messages",
        "x-message-ttl": 1000,
      });
      ch.bindQueue(queue, exchange, "");
      setInterval(async () => {
        await produceMessages(ch, exchange);
      }, 100);
    });
    return ok;
  })
  .then(null, console.warn);
