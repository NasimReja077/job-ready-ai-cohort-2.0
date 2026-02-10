const express = require("express")

// Create Express application (this is our server instance)
const app = express()

// Middleware
// express.json() allows server to read JSON data from request body
// Without this, req.body will be undefined
app.use(express.json())

// In-memory storage (temporary database)
// ⚠ Data will reset whenever server restarts
const notes = []


// ---------------- ROOT ROUTE ----------------
// This route checks whether server is running properly
app.get("/", (req, res) => {
    res.send("app started successfully...");
})


// ---------------- CREATE NOTE ----------------
// POST /notes
// Used to create a new note
// Client sends data in request body (JSON)
app.post("/notes", (req, res) => {

     // Add note into array (temporary storage)
     notes.push(req.body);

     // 201 = Resource Created
     res.status(201).json({
        message: "Note created successfully"
     })
})


// ---------------- READ ALL NOTES ----------------
// GET /notes
// Returns all notes stored in memory
app.get("/notes", (req, res) => {

    // 200 = Successful request
    res.status(200).json({
        notes: notes
    })
})


// ---------------- DELETE NOTE ----------------
// DELETE /notes/:index
// :index is a route parameter
// Example: /notes/0 → deletes first note
app.delete("/notes/:index", (req, res) => {

     // Remove note by index
     // ⚠ delete leaves an empty slot in array
     delete notes[req.params.index]

     // 204 = No Content (usually should not send body with 204)
     res.status(204).json({
        message: 'Note deleted successfully...'
     })
})


// ---------------- UPDATE NOTE ----------------
// PATCH /notes/:index
// Updates only specific field (partial update)
app.patch("/notes/:index", (req, res) => {

     // Update description of selected note
     notes[req.params.index].description = req.body.description;

     res.status(200).json({
        message: 'Note updated successfully...'
     })
})


// Export the app so server.js can use it
module.exports = app
