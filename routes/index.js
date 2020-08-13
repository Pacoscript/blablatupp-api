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
    return logic.registerUser({name, username, password}).then(() => {
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
    return logic.authenticateUser(username, password).then((userId) => {
      const token = jwt.sign({ sub: userId }, JWT_SECRET)
      res.json({
        data: {
          userId,
          token,
        },
      })
    })
  }, res)
})

//CREATE WORKCENTER
router.post(
  '/work-center/:userId',
  [bearerTokenParser, jwtVerifier, jsonBodyParser],
  (req, res) => {
    routeHandler(() => {
      const {
        params: { userId },
        sub,
      } = req
      if (userId !== sub) {
        throw Error('token sub does not match user userId')
      } else {
        const { name, address, city } = req.body
        console.log(name, address, city)
        return logic.createWorkcenter({name, address, city}).then(() => {
          res.status(201)
          res.json({ message: `Work Center ${name} succesfully created` })
        })
      }
    }, res)
  }
)

//CREATE RATION
router.post(
  '/ration/:userId',
  [bearerTokenParser, jwtVerifier, jsonBodyParser],
  (req, res) => {
    routeHandler(() => {
      const {
        params: { userId },
        sub,
      } = req
      if (userId !== sub) {
        throw Error('token sub does not match user userId')
      } else {
        const { name, prize, workCenterId, numberOfRations } = req.body
        return logic
          .createRation({name, prize, userId, workCenterId, numberOfRations})
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
  '/user/assignWorkCenter/:userId',
  [bearerTokenParser, jwtVerifier, jsonBodyParser],
  (req, res) => {
    routeHandler(() => {
      const {
        params: { userId },
        sub,
      } = req
      if (userId !== sub) {
        throw Error('token sub does not match user userId')
      } else {
        const { workCenterId } = req.body
        return logic
          .assignWorkCenter(userId, workCenterId)
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
  '/user/assignRation/:userId',
  [bearerTokenParser, jwtVerifier, jsonBodyParser],
  (req, res) => {
    routeHandler(() => {
      const {
        params: { userId },
        sub,
      } = req
      if (userId !== sub) {
        throw Error('token sub does not match user userId')
      } else {
        const { rationId } = req.body
        return logic
          .assignRation(userId, rationId)
          .then(() => {
            res.status(201)
            res.json({ message: `Ration succesfully assigned` })
          })
      }
    }, res)
  }
)

//RETRIEVE AVAILABLE RATIONS
router.post(
  '/rations/:userId',
  [bearerTokenParser, jwtVerifier, jsonBodyParser],
  (req, res) => {
    routeHandler(() => {
      const {
        params: { userId },
        sub,
      } = req
      if (userId !== sub) {
        throw Error('token sub does not match user userId')
      } else {
        const filters = {...req.body}
        return logic
          .retrieveRations(filters)
          .then(rations => {
            res.status(201)
            res.json({
              data: rations
            })
          })
      }
    }, res)
  }
)


module.exports = router
