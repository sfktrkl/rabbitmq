import amqp from "amqplib";

const amqpServer = "amqp://localhost:5672";

async function connect() {
  try {
    const connection = await amqp.connect(amqpServer);
    const channel = await connection.createChannel();

    await channel.assertQueue("jobs");

    channel.consume("jobs", (message) => {
      const input = JSON.parse(message.content.toString());
      console.log(`Received job with input ${input.number}`);
      if (input.number == 7) channel.ack(message);
    });

    console.log("Waiting for messages...");
  } catch (error) {
    console.error(error);
  }
}

connect();
