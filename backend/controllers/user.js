const bcrypt = require('bcrypt');
// Attribuer un token à l'utilisateur et permet de les vérifier
const jwt = require('jsonwebtoken');
const User = require('../models/user');

//////////////////// INSCRIPTION ////////////////////
// Crypter avec Bcrypt le password
exports.signup = (req, res, next) => {
  // Sécuriser les champs
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;
  const email = req.body.email;
  const password = req.body.password;
 
  if(email.match(emailRegex) && password.match(passwordRegex)) {
    // Hasher le mot de passe de utilisateur, salé 10x
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash
        });
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  } else {
      throw new Error("Mot de passe non sécurisé (ajoutez au moins un chiffre, un signe spéciaux, une lettre minuscule et majuscule) ou email invalide.");
    }
};

//////////////////// CONNEXION ////////////////////
exports.login = (req, res, next) => {
  // Trouver l'utilisateur correspondant à l'email
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          return res.status(401).json({ error: 'Utilisateur non trouvé !' });
        }
        // comparer le password et le hash
        bcrypt.compare(req.body.password, user.password)
          .then(valid => { 
            if (!valid) { // si false comparaison pas bonne
              return res.status(401).json({ error: 'Mot de passe incorrect !' });
            }
            // Renvoi un token au front-end
            res.status(200).json({
              userId: user._id,
              // Vérifier le token a chaque requête par le front-end
              // Voir si les requêtes sont authentifiées
              token: jwt.sign(
                { userId: user._id },
                // clé secrète pour l'encodage
                process.env.TOKEN_SECRET,
                { expiresIn: '24h' }
              )
            });
          })
          .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  };