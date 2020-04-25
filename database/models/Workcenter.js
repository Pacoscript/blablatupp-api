const mongoose = require('mongoose')

const Workcenter = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Workcenter', Workcenter)
