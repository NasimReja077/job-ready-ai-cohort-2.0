import mongoose from 'mongoose';

const validateMongoUri = (uri) => {
    if (!uri) throw new Error('MONGO_URI is not set');
    const parsed = new URL(uri);
    const dbName = decodeURIComponent(parsed.pathname.slice(1));
    if (!dbName || dbName.includes('/')) {
        throw new Error('MONGO_URI must include exactly one database name, e.g. /sandbox_db');
    }
    return uri;
};

const connectDB = async () => {
    try {
        await mongoose.connect(validateMongoUri(process.env.MONGO_URI));
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

export default connectDB;