const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://frgarcia:${password}@cluster0.g1mxgd1.mongodb.net/agrobitacora?retryWrites=true&w=majority`

mongoose.connect(url)

const recordSchema = new mongoose.Schema({
  fecha: String,
  duracion: Number,
  actividad: String,
  descripcion: String,
  responsable: String
})

const Record = mongoose.model('Record', recordSchema)

const record = new Record({
    fecha: "22/02/2022",
    duracion: 55,
    actividad: "labro",
    descripcion: "parcela de abajo",
    responsable: "Paco"
})

record.save().then(result => {
  console.log('record saved!')
  mongoose.connection.close()
})