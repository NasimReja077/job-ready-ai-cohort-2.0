// Import app from src/app.js
const app = require("./src/app")

// Start server on port 3000
// listen() makes server ready to accept requests
app.listen(3000, () => {
    console.log("Server started at port 3000");
})
