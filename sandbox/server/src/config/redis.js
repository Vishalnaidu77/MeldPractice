import Redis from "ioredis";
import { deletePod } from "../kubernetes/pod.js";
import { deleteService } from "../kubernetes/service.js";

const redis = new Redis(process.env.REDIS_URL);
const subscriber = new Redis(process.env.REDIS_URL);

export async function createSandboxKey(sandboxId){
    await redis.set(`sandbox:${sandboxId}`, JSON.stringify({
        status: 'active',
    }), "EX", 120); // Key expired in given time (e.g., 120 seconds)
}

subscriber.config('SET', 'notify-keyspace-events', 'Ex');
subscriber.subscribe('__keyevent@0__:expired');

subscriber.on('message', async (channel, key) => {
    console.log(`Key expired: ${key}`);

    const sandboxId = key.split(':')[1]; // Extract sandboxId from the key

    // Delete the corresponding pod and service when the key expires
    await deletePod(sandboxId);
    await deleteService(sandboxId)
});