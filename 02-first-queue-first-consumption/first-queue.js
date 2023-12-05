import amqp from "amqplib";

amqp
  .connect("amqp://localhost:5672")
  .then(function (conn) {
    console.log("Connection created");
    let ok = conn.createChannel();
    console.log("Channel created");
    ok = ok.then(async function (ch) {
      const queueName = "q.logs.test";
      const queueOptions = { durable: true, autoDelete: true };
      await ch.assertQueue(queueName, queueOptions);
      console.log("Queue added");

      const messageOptions = { persistent: true };
      const messagePayload = Buffer.from("Hello!");
      await ch.sendToQueue(queueName, messagePayload, messageOptions);
      console.log("Message published");

      const consumeOptions = { noAck: false };
      const consumeOnMessage = (message) => {
        console.log(`Message recevied: ${message.content}`);
      };
      await ch.consume(queueName, consumeOnMessage, consumeOptions);

      ch.close();
      console.log("Channel closed");
      conn.close();
      console.log("Connection closed");
    });
    return ok;
  })
  .then(null, console.warn);
