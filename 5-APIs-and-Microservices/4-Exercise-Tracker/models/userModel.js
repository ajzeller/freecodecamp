const mongoose = require('mongoose')

const { Schema } = mongoose

const userSchema = new Schema({
  _id: String,
  username: String
})

const User = mongoose.model('User', userSchema, 'UsersDB')

module.exports = User