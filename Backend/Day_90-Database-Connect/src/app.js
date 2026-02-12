const express = require('express')

const app = express()

app.use(express.json())

app.get('/', (req,res)=>{
    res.send('welcome to my server')
})


module.exports = app