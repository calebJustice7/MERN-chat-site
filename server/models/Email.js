const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let EmailSchema = new Schema({
  sentFromName: {
    type: String
  },
  sentFromEmail: {
    type: String
  },
  message: {
    type: String,
  },
  phone: {
    type: String
  },
  createdAt: {
    type: Date,
    default: new Date()
  }
});

module.exports = Email = mongoose.model('Emails', EmailSchema);
