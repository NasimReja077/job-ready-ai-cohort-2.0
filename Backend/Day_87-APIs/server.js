const express = require("express")
const app = express()

app.use(express.json()) // This is a built-in middleware in Express.
// By default, Express doesn't know how to read the data sent in the "body" of a request (like a JSON object from a frontend or Postman).

//! data will be stoe in db right so we nedd db 

const notes = [
     // {
    //     title:"test title-1",
    //     decription : "test description 1"
    // }
]

app.post("/notes", (req, res) => {
     console.log(req.body) //! user data always will be in req.body

     // This is an object that contains the data sent by the client (user) to the server.

     // When a user fills out a form or saves a note, that data is "packed" into the request body.

     notes.push(req.body)
     res.send("Note Created 📝") // sending a response back to the user.
})

app.get("/notes", (req, res) => {
     res.send(notes)
})

app.get('/',(req,res)=>{
    res.send("welcome to Notes-Web")
})

app.listen(5000, () => {
    console.log("Server is running on port 5000 🎉");
})
