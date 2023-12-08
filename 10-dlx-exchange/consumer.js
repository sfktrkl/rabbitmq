import amqp from "amqplib";

async function consumeMessageReject(conn, queue) {
  let ok = conn.createChannel();
  ok = ok.then(async function (ch) {
    const consumeOptions = { noAck: false };
    const consumeOnMessage = (message) => {
      console.log(`[Consumer ${queue}] Recevied: ${message.content}`);
      ch.reject(message, false);
    };
    await ch.consume(queue, consumeOnMessage, consumeOptions);
    ch.close();
  });
  return ok;
}

async function consumeMessageAck(conn, queue) {
  let ok = conn.createChannel();
  ok = ok.then(async function (ch) {
    const consumeOptions = { noAck: false };
    const consumeOnMessage = (message) => {
      console.log(`[Consumer ${queue}] Recevied: ${message.content}`);
      ch.ack(message);
    };
    await ch.consume(queue, consumeOnMessage, consumeOptions);
    ch.close();
  });
  return ok;
}

setInterval(() => {
  const queue1 = "q.messages";
  amqp
    .connect("amqp://localhost:5672")
    .then(async function (conn) {
      await consumeMessageReject(conn, queue1);
    })
    .then(null, console.warn);
}, 10000);

setInterval(() => {
  const queue2 = "q.dlx.messages";
  amqp
    .connect("amqp://localhost:5672")
    .then(async function (conn) {
      await consumeMessageAck(conn, queue2);
    })
    .then(null, console.warn);
}, 100);
