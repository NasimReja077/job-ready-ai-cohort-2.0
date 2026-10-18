import mongoose from 'mongoose';

export const validateAuthMongoUri = (uri) => {
    if (!uri) {
        throw new Error('AUTH_MONGO_URI is not set');
    }

    let parsedUri;
    try {
        parsedUri = new URL(uri);
    } catch {
        throw new Error('AUTH_MONGO_URI must be a valid MongoDB connection URI');
    }

    if (!['mongodb:', 'mongodb+srv:'].includes(parsedUri.protocol)) {
        throw new Error('AUTH_MONGO_URI must use mongodb:// or mongodb+srv://');
    }

    let databaseName;
    try {
        databaseName = decodeURIComponent(parsedUri.pathname.slice(1));
    } catch {
        throw new Error('AUTH_MONGO_URI must include a valid database name');
    }

    if (!databaseName || databaseName.includes('/') || databaseName.includes('\\')) {
        throw new Error(
            'AUTH_MONGO_URI must include one database name only (for example, /auth_db); database names cannot contain slashes'
        );
    }

    return uri;
};

export const connectDB = async () => {
    await mongoose.connect(validateAuthMongoUri(process.env.AUTH_MONGO_URI));
    console.log('MongoDB connected');
};