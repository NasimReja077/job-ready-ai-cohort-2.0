import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../models/user.model.js';

let mongoServer;

// Function to connect to the in-memory database
export const connect = async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
};

// Function to disconnect from the in-memory database and stop the server
export const disconnect = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await mongoServer.stop();
};

// Function to clear all collections in the database
export const clearCollections = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[ key ].deleteMany({});
    }
};

beforeAll(async () => await connect(), 60000); // MongoMemoryServer may need to download its MongoDB binary
afterAll(async () => await disconnect()); // Disconnect from the in-memory database after running tests

afterEach(async () => await clearCollections()); // Clear the database after each test to ensure isolation between tests

// Test cases for the User model
describe('User Model Test', () => { 
    // Test for creating and saving a user successfully
    it('should create & save user successfully', async () => {
        const validUser = new User({ name: 'John Doe', email: 'john.doe@example.com' });
        const savedUser = await validUser.save();
        expect(savedUser.name).toBe('John Doe');
        expect(savedUser.email).toBe('john.doe@example.com');
    });

    // Test for failing to create a user without required fields
    it('should fail to create user without required fields', async () => {
        const userWithoutRequiredField = new User({ name: 'Jane Doe' });
        let err;
        try {
            await userWithoutRequiredField.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    });
});