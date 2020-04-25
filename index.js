require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cors = require('./utils/cors')
const router = require('./routes')
const package = require('./package.json')

const {
  env: { PORT, DB_URI },
} = process

mongoose
  .connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log(`db server running at ${DB_URI}`)

    const app = express()

    app.use(cors)

    app.use('/api', router)

    app.listen(PORT, () => {
      console.log(
        `${package.name} ${package.version} up and running on port ${PORT}`
      )
    })
  })
  .catch(console.error)
