const mongoose = require('mongoose')
const User = require('../database/models/User')
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
}

module.exports = logic
