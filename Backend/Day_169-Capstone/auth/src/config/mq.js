import amqplib from 'amqplib';

const QUEUE = 'auth_notification_queue';

let channelPromise;

async function getChannel() {
    if (!channelPromise) {
        channelPromise = (async () => {
            const connection = await amqplib.connect(process.env.RABBITMQ_URL);
            const channel = await connection.createChannel();
            await channel.assertQueue(QUEUE, { durable: true });
            return channel;
        })().catch((error) => {
            channelPromise = undefined;
            throw error;
        });
    }

    return channelPromise;
}

export async function sendAuthNotification(message) {
    const channel = await getChannel();
    return channel.sendToQueue(
        QUEUE,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
    );
}