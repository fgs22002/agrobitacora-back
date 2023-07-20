const mongoose = require('mongoose')

const recordSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    required: true
  },
  duracion: Number,
  actividad: {
    type: String,
    required: true,
    minlength: 5
  },
  descripcion: {
    type: String,
    required: true,
    minlength: 5
  },
  responsable: {
    type: String,
    required: true,
    minlength: 2
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

recordSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    returnedObject.fecha = returnedObject.fecha.toISOString().substring(0,10)
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Record = mongoose.model('Record', recordSchema)

module.exports = Record