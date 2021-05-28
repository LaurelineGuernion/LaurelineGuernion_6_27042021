// Crypte le mot de passe
const bcrypt = require('bcrypt');
// Attribuer un token à l'utilisateur et permet de le vérifier
const jwt = require('jsonwebtoken');
// Crypte l'email
const cryptojs = require('crypto-js');

const User = require('../models/user');

//////////////////// INSCRIPTION ////////////////////
exports.signup = (req, res, next) => {
  // Sécuriser les champs
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;
  const espaceRegex = /[\s]/;

  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({error: 'Email ou mot de passe incorrect'});
  };
  const cryptedEmail = cryptojs.HmacSHA256(req.body.email, process.env.EMAIL_KEY_CRYPTO).toString();

  if (email.match(espaceRegex) || password.match(espaceRegex)) {
    return res.status(400).json({ error: 'Les espaces ne sont pas autorisés' });
  } else if(email.match(emailRegex) && password.match(passwordRegex)) {
    // Crypter le mot de passe, sale 10x pour renforcer le cryptage
    bcrypt.hash(password, 10)
      .then(hash => {
        // Récupérer le hash du mot de passe à enregistrer dans la BDD
        const user = new User({
          // Masquer l'email
          email: cryptedEmail,
          // Enregistrer le hash du mot de passe
          password: hash
        });
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  } else {
      throw new Error("Mot de passe pas assez sécurisé ou email invalide.");
   }
};

//////////////////// CONNEXION ////////////////////
exports.login = (req, res, next) => {
  // Trouver l'utilisateur correspondant à l'email
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).json({error: 'Email ou mot de passe incorrect'});
  };
  const cryptedEmail = cryptojs.HmacSHA256(req.body.email, process.env.EMAIL_KEY_CRYPTO).toString();
  
  // Vérifier l'email, si c'est false une erreur s'affiche
  User.findOne({email: cryptedEmail})
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Email non valide !' });
      };
      // Comparer le mot de passe et le hash
      bcrypt.compare(req.body.password, user.password)
        .then(valid => { 
          if (!valid) {
            // si c'est false alors la comparaison n'est pas bonne
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
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