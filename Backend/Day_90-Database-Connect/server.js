// Import app from src/app.js
const app = require("./src/app")
const mongoose = require("mongoose");

function connectToMongoose(){
    mongoose.connect('')
    .then(() =>{
        console.log("Connected to database....")
    })
}

connectToMongoose();

// Start server on port 3000
// listen() makes server ready to accept requests
app.listen(3000, () => {
    console.log("Server started at port 3000");
})
