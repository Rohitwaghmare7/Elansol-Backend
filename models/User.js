const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
      dob: {
        type: Date,
        required: true,
      },
    });
  const User = mongoose.model('user', UserSchema);
  module.exports = User;