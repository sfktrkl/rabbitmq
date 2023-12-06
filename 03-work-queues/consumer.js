import amqp from "amqplib";

async function consumeMessageAck(conn, queue) {
  let ok = conn.createChannel();
  ok = ok.then(async function (ch) {
    const consumeOptions = { noAck: false };
    const consumeOnMessage = (message) => {
      console.log(`[Consumer Ack] Recevied: ${message.content}`);
      ch.ack(message);
    };
    await ch.consume(queue, consumeOnMessage, consumeOptions);
    ch.close();
  });
  return ok;
}

async function consumeMessageNoAck(conn, queue) {
  let ok = conn.createChannel();
  ok = ok.then(async function (ch) {
    const consumeOptions = { noAck: false };
    const consumeOnMessage = (message) => {
      console.log(`[Consumer NoAck] Recevied: ${message.content}`);
    };
    await ch.consume(queue, consumeOnMessage, consumeOptions);
    ch.close();
  });
  return ok;
}

const queueName = "q.application.events";
setInterval(() => {
  amqp
    .connect("amqp://localhost:5672")
    .then(async function (conn) {
      await consumeMessageNoAck(conn, queueName);
    })
    .then(null, console.warn);

  amqp
    .connect("amqp://localhost:5672")
    .then(async function (conn) {
      await consumeMessageAck(conn, queueName);
    })
    .then(null, console.warn);

  amqp
    .connect("amqp://localhost:5672")
    .then(async function (conn) {
      await consumeMessageNoAck(conn, queueName);
    })
    .then(null, console.warn);
}, 1000);
