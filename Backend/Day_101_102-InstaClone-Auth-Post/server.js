require('dotenv').config();

const app = require('./src/app');
const connectToDatabase = require('./src/config/database');

connectToDatabase();

PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
     console.log(`Server is running on port ${PORT}`);
})