require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
var morgan = require('morgan')
const app = express()
const Record = require('./models/record')

app.use(express.json())
app.use(cors()) // permitimos solicitudes de todos los orígenes
app.use(express.static('build')) // Servir ficheros estáticos de la carpeta 'build'

// HTTP request logger middleware for node.js
morgan.token('body', function (req, res) { 
    console.log(req.body)
    return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/records', (request, response) => {
    Record.find({}).then(records => 
        response.json(records)
    )
})

app.get('/api/records/:id', (request, response) => {
    Record.findById(request.params.id).then(record => {
        response.json(record)
    }).catch( error => {
        console.log("Error while retrieving a record...", error)
        response.status(404).end()
    })
})

app.delete('/api/records/:id', (request, response) => {
    const id = Number(request.params.id)
    records = records.filter(record => record.id !== id)
  
    response.status(204).end()
})

const generateId = () => {
    function getRandomInt(max) {
        return Math.floor(Math.random() * max)
    }
    return getRandomInt(999999999)
  }

app.post('/api/records', (request, response) => {
    const body = request.body
  
    if (!body.fecha || !body.actividad || !body.descripcion || !body.responsable) {
      return response.status(400).json({ 
        error: 'missing information' 
      })
    } 
  
    const record = new Record({
      fecha: body.fecha,
      duracion: body.duracion,
      actividad: body.actividad,
      descripcion: body.descripcion,
      responsable: body.responsable,
      id: generateId(),
    })
    
    record.save().then(savedRecord => {
        response.json(savedRecord)
    })    
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})