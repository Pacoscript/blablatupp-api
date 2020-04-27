const express = require('express')
const bodyParser = require('body-parser')
const jsonBodyParser = bodyParser.json({ limit: '50mb' })
const logic = require('../logic')
const routeHandler = require('./route-handler')
const jwt = require('jsonwebtoken')

const router = express.Router()

const {
  env: { JWT_SECRET },
} = process

// REGISTER USER
router.post('/users', jsonBodyParser, (req, res) => {
  routeHandler(() => {
    const { name, username, password } = req.body
    return logic.registerUser(name, username, password).then(() => {
      res.status(201)
      res.json({
        message: `${username} successfully registered`,
      })
    })
  }, res)
})

//AUTHENTICATE
router.post('/auth', jsonBodyParser, (req, res) => {
  routeHandler(() => {
    const { username, password } = req.body

    return logic.authenticateUser(username, password).then(id => {
      const token = jwt.sign({ sub: id }, JWT_SECRET)
      res.json({
        data: {
          id,
          token,
        },
      })
    })
  }, res)
})

//CREATE WORKCENTER
router.post('/work-center', jsonBodyParser, (req, res) => {
  routeHandler(() => {
    const { name, address, city } = req.body
    return logic.createWorkcenter(name, address, city).then(() => {
        res.status(201)
        res.json({message: `Work Center ${name} succesfully created`})
      })
  }, res)
})

//CREATE RATION
router.post('/ration', jsonBodyParser, (req, res) => {
  routeHandler(() => {
    const { name, prize, createdBy, workCenterId } = req.body
    return logic.createRation(name, prize, createdBy, workCenterId).then(() => {
        res.status(201)
        res.json({message: `Ration ${name} succesfully created`})
      })
  }, res)
})

module.exports = router
