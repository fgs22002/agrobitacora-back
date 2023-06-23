require('dotenv').config()
const express = require('express')
const cors = require('cors')
var morgan = require('morgan')
const app = express()
const Record = require('./models/record')

app.use(express.static('build')) // Servir ficheros estáticos de la carpeta 'build'
app.use(express.json())
app.use(cors()) // permitimos solicitudes de todos los orígenes

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

app.get('/api/records/:id', (request, response, next) => {
    Record.findById(request.params.id).then(record => {
        if (record) {

            response.json(record)
        } else {
            console.log('Error while retrieving a record...', request.params.id)
            response.status(404).end()
        }
    }).catch( error => next(error) )
})

app.put('/api/records/:id', (request, response, next) => {
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
    }

    Record.findByIdAndUpdate(request.params.id, record, { new: true }) // De forma predeterminada, el parámetro updatedNote del controlador de eventos recibe el documento original sin las modificaciones. Agregamos el parámetro opcional { new: true }, que hará que nuestro controlador de eventos sea llamado con el nuevo documento modificado en lugar del original.
        .then(updatedRecord => {
            response.json(updatedRecord)
        })
        .catch( error => next(error) )
})

app.delete('/api/records/:id', (request, response, next) => {
    Record.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

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
    })

    record.save().then(savedRecord => {
        response.json(savedRecord)
    })
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}
// handler of requests with result to errors
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})