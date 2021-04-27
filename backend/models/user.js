const mongoose = require('mongoose');
// Appeler isEmail de la bibliothèque Validator - contrôle les emails
const { isEmail } = require('validator');

const userSchema = mongoose.Schema({
    // Trim permet de supprimer les espaces superflus
    email: { type: String, required: true, validate: [isEmail], unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, max: 1024, minLength: 6, trim: true }
});

module.exports = mongoose.model('User', userSchema);