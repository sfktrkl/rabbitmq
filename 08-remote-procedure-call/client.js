import amqp from "amqplib";

async function remoteProcedureCall(ch, exclusive, value) {
  const queue = "q.rpc_queue";
  const message = value.toString();
  const correlationId = Math.random().toString();
  console.log(`[Client] Request to ${exclusive}: dofun(${value})`);
  ch.sendToQueue(queue, Buffer.from(message), {
    correlationId: correlationId,
    replyTo: exclusive,
  });

  const response = new Promise((resolve, reject) => {
    const consumeOnMessage = (message) => {
      if (message.properties.correlationId === correlationId) {
        resolve(message.content.toString());
      }
    };
    ch.consume(exclusive, consumeOnMessage, { noAck: true });
  });
  return response;
}

setInterval(() => {
  amqp
    .connect("amqp://localhost:5672")
    .then(function (conn) {
      let ok = conn.createChannel();
      ok = ok.then(async function (ch) {
        const value = Math.ceil(Math.random() * 1e5).toString();
        const exclusive = await ch.assertQueue("", { exclusive: true });
        const response = await remoteProcedureCall(ch, exclusive.queue, value);
        console.log(`[Client] Received: '${response}'`);
      });
      return ok;
    })
    .then(null, console.warn);
}, 1000);
