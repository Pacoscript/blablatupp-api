const mongoose = require('mongoose')
const { SchemaTypes: { ObjectId } } = require('mongoose')

const RationSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for the ration']
  },
  prize: {
    type: Number,
    required: [true, 'Please a prize for your ration']
  },
  photo: {
    type: String,
    default: '#',
    required: true
  },
  createdBy: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  buyedBy: {
    type: ObjectId,
    ref: 'User'
  },
  workCenter: {
    type: ObjectId,
    ref: 'User'
  },
  creationDate: {
    type: Date
  },
  sold: {
    type: Boolean,
    default: false
  }
})

module.exports = mongoose.model('Ration', RationSchema)
