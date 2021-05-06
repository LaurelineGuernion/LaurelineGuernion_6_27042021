const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    // Trim permet de supprimer les espaces superflus
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minLength: 6, trim: true }
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);