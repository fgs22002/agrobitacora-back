const recordsRouter = require('express').Router()
const Record = require('../models/record')

recordsRouter.get('/', (request, response) => {
  Record.find({}).then(records =>
    response.json(records)
  )
})

recordsRouter.get('/:id', (request, response, next) => {
  Record.findById(request.params.id).then(record => {
    if (record) {

      response.json(record)
    } else {
      console.log('Error while retrieving a record...', request.params.id)
      response.status(404).end()
    }
  }).catch( error => next(error) )
})

recordsRouter.put('/:id', (request, response, next) => {
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

recordsRouter.delete('/:id', (request, response, next) => {
  Record.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

recordsRouter.post('/', (request, response, next) => {
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

  record.save()
    .then(savedRecord => {
      response.json(savedRecord)
    })
    .catch(error => next(error))
})

module.exports = recordsRouter