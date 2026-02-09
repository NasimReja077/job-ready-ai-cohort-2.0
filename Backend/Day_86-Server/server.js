const express = require('express')
const app = express() // Now server instance create

app.get('/', (req, res) => {
     res.send("Hello World")
})

app.get('/about', function (req, res){
     res.send("This About Page")
})

app.get("/home", (req, res) => {
     res.send("This is Home Page")
})

app.get("/home", (req, res)=>{
    res.send("loading the home page")
})

app.get("/name",(req,res)=>{
    res.send("loading your name")
})

app.get("/sirname",(req,res)=>{
    res.send("loading your sirname")
})

app.listen(5000, ()=>{
     console.log("Server started on http://localhost:5000");
}) // server start



// generally usable ports 2000, 3000, 8000, 7000, 5173
// npx nodemon index.js run this command for seeing a live changes
// npm is a package manager 
// npm is a package executioner
