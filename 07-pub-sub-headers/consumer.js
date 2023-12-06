import amqp from "amqplib";

async function consumeMessageAck(conn, queue) {
  let ok = conn.createChannel();
  ok = ok.then(async function (ch) {
    const consumeOptions = { noAck: false };
    const consumeOnMessage = (message) => {
      console.log(
        `[Consumer ${queue} ${JSON.stringify(
          message.properties.headers
        )}] Recevied: ${message.content}`
      );
      ch.ack(message);
    };
    await ch.consume(queue, consumeOnMessage, consumeOptions);
    ch.close();
  });
  return ok;
}

setInterval(() => {
  const queue1 = "q.application.events.client1";
  amqp
    .connect("amqp://localhost:5672")
    .then(async function (conn) {
      await consumeMessageAck(conn, queue1);
    })
    .then(null, console.warn);

  const queue2 = "q.application.events.client2";
  amqp
    .connect("amqp://localhost:5672")
    .then(async function (conn) {
      await consumeMessageAck(conn, queue2);
    })
    .then(null, console.warn);
}, 1000);
