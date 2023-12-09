import amqp from "amqplib";

function dofun(n) {
  return `${n} + ${n} = ${n + n}`;
}

async function assertQueue(ch) {
  const queueName = "q.rpc_queue";
  const queueOptions = { durable: true };
  await ch.assertQueue(queueName, queueOptions);
  await ch.prefetch(1); // Limit each consumer to one message at a time
  return queueName;
}

amqp
  .connect("amqp://localhost:5672")
  .then(function (conn) {
    let ok = conn.createChannel();
    ok = ok.then(async function (ch) {
      const queue = await assertQueue(ch);

      const consumeOnMessage = async (msg) => {
        const messageOptions = { correlationId: msg.properties.correlationId };
        const message = msg.content.toString();
        console.log(
          `[Service] Received reply to ${msg.properties.replyTo}: ${message}, ` +
            `with correlation ID: ${msg.properties.correlationId}`
        );
        const response = dofun(parseInt(message));
        ch.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(response),
          messageOptions
        );
        console.log(`[Service] Sent to ${msg.properties.replyTo}: ${response}`);
        ch.ack(msg);
      };
      await ch.consume(queue, consumeOnMessage, { noAck: false });
    });
    return ok;
  })
  .then(null, console.warn);
