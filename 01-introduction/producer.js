import amqp from "amqplib";

const msg = { number: process.argv[2] };
const amqpServer = "amqp://localhost:5672";

async function connect() {
  try {
    const connection = await amqp.connect(amqpServer);
    const channel = await connection.createChannel();

    await channel.assertQueue("jobs");
    channel.sendToQueue("jobs", Buffer.from(JSON.stringify(msg)));

    console.log(`Job sent successfully ${msg.number}`);

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error(error);
  }
}

connect();
