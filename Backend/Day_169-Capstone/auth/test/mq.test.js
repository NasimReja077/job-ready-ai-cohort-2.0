import assert from 'node:assert/strict';
import test from 'node:test';

test('loads the auth messaging module without connecting to RabbitMQ', async () => {
    await assert.doesNotReject(import('../src/config/mq.js'));
});
