const recordsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Record = require('../models/record')
const User = require('../models/user')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

const getAuthorizedUser = async (request) => {
  const token = getTokenFrom(request)
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken.id) {
    return null
    //return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)
  return user
}
/*
recordsRouter.get('/', async (request, response) => {
  const records = await Record.find({}).populate('user', { username: 1 })
  response.json(records)
})
*/
recordsRouter.get('/', async (request, response) => {
  const user = await getAuthorizedUser(request)
  if (!user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const records = await Record.find({ user: user._id }).populate('user', { username: 1 })
  response.json(records)
})

recordsRouter.post('/', async (request, response) => {
  const body = request.body

  const user = await getAuthorizedUser(request)
  if (!user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

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
    user: user._id
  })

  const savedRecord = await record.save()
  user.records = user.records.concat(savedRecord._id)
  await user.save()

  response.status(201).json(savedRecord)
})

recordsRouter.get('/:id', async (request, response) => {
  const user = await getAuthorizedUser(request)
  if (!user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const record = await Record.findOne({ user: user._id, _id: request.params.id })
  if (record) {
    response.json(record)
  } else {
    response.status(404).end()
  }
})

recordsRouter.put('/:id', async (request, response) => {
  const body = request.body
  const user = await getAuthorizedUser(request)
  if (!user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

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

  const updatedRecord = await Record.findOneAndUpdate({ user: user._id, _id: request.params.id }, record, { new: true }) // De forma predeterminada, el parámetro updatedNote del controlador de eventos recibe el documento original sin las modificaciones. Agregamos el parámetro opcional { new: true }, que hará que nuestro controlador de eventos sea llamado con el nuevo documento modificado en lugar del original.
  if (updatedRecord) {
    response.json(updatedRecord)
  } else {
    response.status(404).end()
  }
})

recordsRouter.delete('/:id', async (request, response) => {
  const user = await getAuthorizedUser(request)
  if (!user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  await Record.findOneAndRemove({ user: user._id, _id: request.params.id })
  response.status(204).end()
})

module.exports = recordsRouter