const jwt = require('jsonwebtoken');

//////////////////// AUTHENTIFICATION AVEC UN TOKEN ////////////////////
module.exports = (req, res, next) => {
  try {
    // Récupérer le Token après l'espace
    const token = req.headers.authorization.split(' ')[1];
    // Vérifier le token
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    // Récupérer l'Id de l'utilisateur du token vérifié
    const userId = decodedToken.userId;

    // Vérifier si l'Id correspond au Token
    if (req.body.userId && req.body.userId !== userId) {
      throw "L'Id user est non valable !";
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error('La requête est invalide !')
    });
  }
};