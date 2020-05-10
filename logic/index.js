const mongoose = require('mongoose')
const User = require('../database/models/User')
const Workcenter = require('../database/models/Workcenter')
const Ration = require('../database/models/Ration')
const {
  AlreadyExistsError,
  AuthError,
  NotAllowedError,
  NotFoundError,
} = require('../errors')
const validate = require('../utils/validate')
const bcrypt = require('bcrypt')

const logic = {
  registerUser(name, username, password) {
    validate([
      { key: 'name', value: name, type: String },
      { key: 'username', value: username, type: String },
      { key: 'password', value: password, type: String },
    ])

    return (async () => {
      let user = await User.findOne({ username })
      if (user)
        throw new AlreadyExistsError(`username ${username} already registered`)
      user = new User({ name, username, password })
      await user.save()
    })()
  },

  authenticateUser(username, password) {
    validate([
      { key: 'username', value: username, type: String },
      { key: 'password', value: password, type: String },
    ])

    return (async () => {
      const user = await User.findOne({ username })
      if (!user || !bcrypt.compareSync(password, user.password))
        throw new AuthError('invalid username or password')

      return user.id
    })()
  },

  createWorkcenter(name, address, city) {
    validate([
      { key: 'name', value: name, type: String },
      { key: 'address', value: address, type: String },
      { key: 'city', value: city, type: String },
    ])

    return (async () => {
      let center = await Workcenter.findOne({ name })
      if (center)
        throw new AlreadyExistsError(`workcenter ${name} already registered`)
      workCenter = new Workcenter({ name, address, city })
      await workCenter.save()
    })()
  },

  createRation(name, prize, createdBy, workCenterId) {
    validate([
      { key: 'name', value: name, type: String },
      { key: 'prize', value: prize, type: Number },
      { key: 'createdBy', value: createdBy, type: String },
      { key: 'workCenterId', value: workCenterId, type: String },
    ])
    return (async () => {
      ration = new Ration({ name, prize, createdBy, workCenterId, creationDate: Date.now() })
      await ration.save()
    })()
  },

  assignWorkCenter(userId, workCenterId) {
    validate([
      { key: 'userId', value: userId, type: String },
      { key: 'workCenterId', value: workCenterId, type: String },
    ])
    return (async () => {
      const user = await User.findById(userId)
      user.workCenter = workCenterId
      await user.save()
    })()
  },

  assignRation(userId, rationId) {
    validate([
      { key: 'userId', value: userId, type: String },
      { key: 'rationId', value: rationId, type: String },
    ])
    return (async () => {
      const user = await User.findById(userId)
      const ration = await Ration.findById(rationId)
      if (ration.sold) throw new AlreadyExistsError('ration assigned')
      else if (user.buyedRations.includes(rationId))
        throw new AlreadyExistsError('existing ration, not added')
      else {
        user.buyedRations.push(rationId)
        ration.sold = true
        ration.buyedBy = user.id
        await user.save()
        await ration.save()
      }
    })()
  },

  retrieveRations () {
    return (async () => {
      const rations = await Ration.find({ sold: 'false' })
      const data = rations.map(ration => {
        const { photo, _id, prize, createdBy, creationDate, name } = ration
        return {photo, rationId: _id , prize, createdBy, creationDate, name}
      })
      return data
    })()
  }
}

module.exports = logic
