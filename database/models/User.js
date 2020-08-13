const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your username'],
  },
  username: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide your password'],
  },
  photo: {
    type: String,
    default: '#',
  },
  workCenter: {
    type: String,
  },
  createdRations: {
    type: Array,
  },
  buyedRations: {
    type: Array,
  },
  soldRations: {
    type: Array,
  },
})

UserSchema.pre('save', function (next) {
  const user = this
  const hash = bcrypt.hashSync(user.password, 10)
  user.password = hash
})

module.exports = mongoose.model('User', UserSchema)
