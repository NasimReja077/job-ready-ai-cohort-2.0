const express = require("express")
const app = express() // Creating Express application (our server instance)

// Middleware
// express.json() allows server to read JSON data from request body
app.use(express.json())

// In-memory database (temporary storage)
// Data will reset whenever server restarts
const notes = [
    // Example structure:
    // {
    //     title: "test title-1",
    //     description: "test description 1"
    // }
]

// Default Route
// This route checks if server is running
app.get("/", (req, res) => {
    res.send("App Started Successfully...");
})


// CREATE NOTE (POST)
// Adds a new note to the array
app.post("/notes", (req, res) => {
     console.log(req.body); // Data sent by client

     // Push user data into notes array
     notes.push(req.body);

     console.log(notes); // See updated notes array in console

     res.send("Note created successfully...");
})


// READ NOTES (GET)
// Returns all stored notes
app.get("/notes", (req, res) => {
    res.send(notes)
})


// DELETE NOTE
// :index is a route parameter
// Example: /notes/0 → deletes first note
app.delete("/notes/:index", (req, res) => {

     // Remove note by index
     delete notes[req.params.index]

     res.send("Note deleted successfully....")
})


// UPDATE NOTE (PATCH)
// Updates only the description field of a note
app.patch("/notes/:index", (req, res) => {

     // Access note by index and update description
     notes[req.params.index].description = req.body.description;

     res.send("Description updated successfully.....");
})

// Exporting app so it can be used in server.js
module.exports = app