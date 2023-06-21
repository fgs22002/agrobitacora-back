const express = require('express')
const cors = require('cors')
var morgan = require('morgan')
const app = express()

app.use(express.json())
app.use(cors()) // permitimos solicitudes de todos los orígenes
app.use(express.static('build')) // Servir ficheros estáticos de la carpeta 'build'

// HTTP request logger middleware for node.js
morgan.token('body', function (req, res) { 
    console.log(req.body)
    return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let records = [
    {
        id: 1, 
        fecha: "23/05/2023",
        duracion: 25,
        actividad: "act1",
        descripcion: "desc1",
        responsable: "paco",
    },
    {
        id: 2, 
        fecha: "26/06/2023",
        duracion: 50,
        actividad: "act2",
        descripcion: "desc2",
        responsable: "pepe",
    },
]

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
    const text = "<p>Agrobitacora has info for " + records.length + " records</p>" + "<p>"+ new Date() + "</p>"

    response.send(text)
})


app.get('/api/records', (request, response) => {
    response.json(records)
})

app.get('/api/records/:id', (request, response) => {
    const id = Number(request.params.id)
    const record = records.find(record => record.id === id)
    if (record) {
       response.json(record)
    } else {
        response.status(404).end()
    }

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
  
    const record = {
      fecha: body.fecha,
      duracion: body.duracion,
      actividad: body.actividad,
      descripcion: body.descripcion,
      responsable: body.responsable,
      id: generateId(),
    }
  
    records = records.concat(record)
  
    response.json(record)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})