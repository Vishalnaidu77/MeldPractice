import amqplib from "amqplib";

const QUEUE = "notification_queue";

const connection = await amqplib.connect(process.env.QUEUE_URL);
const channel = await connection.createChannel();

await channel.assertQueue(QUEUE, { durable: true });

export async function sendAuthNotification(message) {
    try {
        channel.sendToQueue(
            QUEUE,
            Buffer.from(JSON.stringify(message)),
            { persistent: true }
        )
    } catch (err) {
        console.error("Error sending message to queue:", err);
    }
};