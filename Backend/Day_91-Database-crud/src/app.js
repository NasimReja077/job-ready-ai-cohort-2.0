const express = require('express')
const noteModel = require("./models/notes.models");

const app = express()
app.use(express.json()) /* Middleware */

/* - POST /notes 
   - req.body => {title,description}     
*/

app.post("/api/notes", async (req, res) => {
    const { title, description } = req.body;
    const note = await noteModel.create({
        title,
        description,
    });
    res.status(201).json({
        message: "🎉 Note created successfully",
        note,
    });
});

/*
    - GET /notes
    - Fetch All The Notes Data
*/

app.get('/api/notes', async (req, res)=> {
    const notes = await noteModel.find();
    res.status(200).json({
        message: '🎉 Notes fetched successfully',
        notes,
    });
});


// app.delete('/note/:id', async (req,res)=>{
//     const id = req.params.id
//     await note.findByIdAndDelete(id)
//     return res.status(204).json({
//         message: 'note deleted successfully'
//     })
// })


app.get('/', (req,res)=>{
    res.status(200).json({
        message:'🎉 Welocome to our Notes Platform 🎉'
    });
});



module.exports = app