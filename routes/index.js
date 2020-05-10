const express = require('express')
const bodyParser = require('body-parser')
const jsonBodyParser = bodyParser.json({ limit: '50mb' })
const logic = require('../logic')
const routeHandler = require('./route-handler')
const jwt = require('jsonwebtoken')
const bearerTokenParser = require('../utils/bearer-token-parser')
const jwtVerifier = require('./jwt-verifier')

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
    return logic.authenticateUser(username, password).then((id) => {
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
router.post(
  '/work-center/:id',
  [bearerTokenParser, jwtVerifier, jsonBodyParser],
  (req, res) => {
    routeHandler(() => {
      const {
        params: { id },
        sub,
      } = req
      if (id !== sub) {
        throw Error('token sub does not match user id')
      } else {
        const { name, address, city } = req.body
        console.log(name, address, city)
        return logic.createWorkcenter(name, address, city).then(() => {
          res.status(201)
          res.json({ message: `Work Center ${name} succesfully created` })
        })
      }
    }, res)
  }
)

//CREATE RATION
router.post(
  '/ration/:id',
  [bearerTokenParser, jwtVerifier, jsonBodyParser],
  (req, res) => {
    routeHandler(() => {
      const {
        params: { id },
        sub,
      } = req
      if (id !== sub) {
        throw Error('token sub does not match user id')
      } else {
        const { name, prize, createdBy, workCenterId } = req.body
        return logic
          .createRation(name, prize, createdBy, workCenterId)
          .then(() => {
            res.status(201)
            res.json({ message: `Ration ${name} succesfully created` })
          })
      }
    }, res)
  }
)

//ASSIGN WORKCENTER
router.patch(
  '/user/assignWorkCenter/:id',
  [bearerTokenParser, jwtVerifier, jsonBodyParser],
  (req, res) => {
    routeHandler(() => {
      const {
        params: { id },
        sub,
      } = req
      if (id !== sub) {
        throw Error('token sub does not match user id')
      } else {
        const { workCenterId } = req.body
        return logic
          .assignWorkCenter(id, workCenterId)
          .then(() => {
            res.status(201)
            res.json({ message: `Workcenter succesfully assigned` })
          })
      }
    }, res)
  }
)

//ASSIGN RATION
router.patch(
  '/user/assignRation/:id',
  [bearerTokenParser, jwtVerifier, jsonBodyParser],
  (req, res) => {
    routeHandler(() => {
      const {
        params: { id },
        sub,
      } = req
      if (id !== sub) {
        throw Error('token sub does not match user id')
      } else {
        const { rationId } = req.body
        return logic
          .assignRation(id, rationId)
          .then(() => {
            res.status(201)
            res.json({ message: `Ration succesfully assigned` })
          })
      }
    }, res)
  }
)


module.exports = router
