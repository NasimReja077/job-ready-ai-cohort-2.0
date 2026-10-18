import app from './src/app.js';
import { connectDB } from './src/config/db.js';

try {
    await connectDB();
    app.listen(3000, () => {
        console.log('Auth server is running on http://localhost:3000');
    });
} catch (err) {
    console.error('Failed to start auth server:', err);
    process.exit(1);
}