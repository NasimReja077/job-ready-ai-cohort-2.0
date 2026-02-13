// Import app from src/app.js
const app = require("./src/app");
const connectDB = require('./src/config/database');
const PORT = 3000;

require('dotenv').config();
connectDB();

app.listen(PORT, (req, res) => {
    console.log(`Server is Running on ${PORT} Port 🎉`);
})
