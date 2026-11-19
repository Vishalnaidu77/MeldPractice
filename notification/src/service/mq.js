import amqplib from "amqplib";

const QUEUE = "notification_queue";

const connection = await amqplib.connect(process.env.QUEUE_URL);
const channel = await connection.createChannel();

await channel.assertQueue(QUEUE, { durable: true });

export default channel;