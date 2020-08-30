const mongoose = require('mongoose');
const collectionName = 'Users';
const Schema = mongoose.Schema;
const schema = new Schema({
  name: {
    type: String,
    required: true
  },
  sex: {
    type: String,
    required: false,
    default : ''
  },
  mobile: {
    type: String,
    required: false,
    default : ''
  },
  age: {
    type: String,
    required: false,
    default : ''
  },
  address: {
    type: String,
    required: false,
    default : ''
  },
  personId : {
    type: String,
    required: true
  },
  face1: {
    type: String,
    required: false
  },
  face2: {
    type: String,
    required: false,
    default : ''
  },
  face3: {
    type: String,
    required: false,
    default : ''
  },
  face4: {
    type: String,
    required: false,
    default : ''
  },
  face5: {
    type: String,
    required: false,
    default : ''
  }

});
const model = mongoose.model('Users', schema, collectionName);
module.exports = model;
