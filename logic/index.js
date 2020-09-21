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
  registerUser (args) {
    const name = args.name
    const username = args.username
    const password = args.password
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

  authenticateUser (username, password) {
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
  
  getUserInfo (userId) {
    return (async () => {
      const user = await User.findOne({ _id: userId })
      const workCenter = await Workcenter.findOne({ _id: user.workCenter })
      return {
        name: user.name,
        workCenter: workCenter,
        createdRations: user.createdRations.length,
        buyedRations: user.buyedRations.length,
        soldRations: user.soldRations.length        
      }
    })()
  },

  createWorkcenter (args) {
    const name = args.name
    const address = args.address
    const city = args.city
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

  createRation (args) {
    const name = args.name
    const prize = args.prize
    const createdBy = args.userId
    const workCenterId = args.workCenterId
    const numberOfRations = args.numberOfRations
    validate([
      { key: 'name', value: name, type: String },
      { key: 'prize', value: prize, type: Number },
      { key: 'createdBy', value: createdBy, type: String },
      { key: 'workCenterId', value: workCenterId, type: String },
      { key: 'numberOfRations', value: numberOfRations, type: Number },
    ])
    return (async () => {
      const user = await User.findById({ _id: createdBy })
      if (user.workCenter !== workCenterId)
        throw new NotAllowedError(`user can´t create a ration in other workcenter`)
      if (numberOfRations > 5)
        throw new NotAllowedError('you can´t create more than five rations')
      for (let i = 0; i < numberOfRations; i++){
        ration = new Ration({
          name,
          prize,
          createdBy,
          workCenter: workCenterId,
          creationDate: Date.now(),
        })
        user.createdRations.push(ration._id)
        await ration.save()
        await user.save()
      }

    })()
  },

  retrieveWorkplaces() {
    return (async () => {
      const data = await Workcenter.find()
      return data
    })()
  },

  retrieveWorkplace(workCenterId) {
    debugger
    validate([
      { key: 'workCenterId', value: workCenterId, type: String },
    ])
    return(async () => {
      const data = await Workcenter.findById(workCenterId)
      return data
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
      else {
        user.buyedRations.push(rationId)
        ration.sold = true
        ration.buyedBy = user.id
        await user.save()
        await ration.save()
      }
    })()
  },

  retrieveRations (filters) {
    const keys = Object.keys(filters)
    let activeFilters = {}
    keys.forEach(key => {
      if (filters[key] !== undefined) activeFilters = {...activeFilters, [key]: filters[key]}
    })

    return (async () => {
      const rations = await Ration.find(activeFilters)
      const data = rations.map((ration) => {
        const {
          photo,
          _id,
          prize,
          createdBy,
          creationDate,
          name,
          workCenter,
        } = ration
        return {
          photo,
          rationId: _id,
          prize,
          createdBy,
          creationDate,
          name,
          workCenter,
        }
      })
      return data
    })()
  },
}

module.exports = logic
