import assert from 'node:assert/strict';
import test from 'node:test';
import { validateAuthMongoUri } from '../src/config/db.js';

test('accepts a MongoDB URI with one database name', () => {
    const uri = 'mongodb://127.0.0.1:27017/auth_db';

    assert.equal(validateAuthMongoUri(uri), uri);
});

test('rejects a MongoDB URI with a slash in the database name', () => {
    assert.throws(
        () => validateAuthMongoUri('mongodb+srv://cluster.example/codespaces/auth_db'),
        /one database name only/
    );
});

test('requires a MongoDB URI', () => {
    assert.throws(() => validateAuthMongoUri(''), /AUTH_MONGO_URI is not set/);
});
