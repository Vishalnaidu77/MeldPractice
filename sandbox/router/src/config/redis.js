import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

redis.on('connect', () => {
    console.log('Connected to Redis');
});

redis.on('error', (err) => {
    console.error('Redis error:', err);
});

export async function refreshTTl(sandboxId) {
    try {
        await redis.expire(`sandbox:${sandboxId}`, 120); // Refresh TTL to 120 seconds
    } catch (err) {
        console.error('Error refreshing TTL:', err);
    }
}