const express = require('express');
const mongoose = require('mongoose');
// Fournir des utilitaires pour travailler avec les chemins de fichiers et de répertoires
const path = require('path');
// Au lieu de spécifier manuellement le cors le package cors peut-être utilisé à la place
//const cors = require('cors');

//////////////////// SÉCURITÉ ////////////////////
// Journalisation des requêtes
const morgan = require('morgan');
// Analyser l'activité de l'application - détecter les problèmes
const logger = require('./config/logger');
// Protection cookie
const session = require('cookie-session');
// Sécuriser Express en définissant divers en-têtes HTTP
const helmet = require('helmet');
// Variables d'environnement - masque les informations de login
require('dotenv').config({path: './config/.env'})
// Désactiver la mise en cache côté client
const nocache = require("nocache");
// Nettoyer des données contre les attaques par injection NoSQL
const mongoSanitize = require('express-mongo-sanitize');
// Contrer les attaques XSS
// Nettoyer les entrées utilisateur (corps POST, requêtes GET, paramètres d'URL)
const xss = require('xss-clean');
// Limiter les demandes répétées de requêtes
const rateLimit = require('express-rate-limit');


//////////////////// IMPORTATION ROUTES ////////////////////
const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

//////////////////// MISE EN PLACE DES PACKAGES ////////////////////
const app = express();
// limiter la charge que l'user peut soumettre à l'app
app.use(express.json ({limite: '10kb'}));
app.use(helmet());
app.use(nocache());
//app.use(cors());
app.use(mongoSanitize());
app.use(xss());
app.use(morgan('combined', { stream: logger.stream }));


//////////////////// CONNEXION À MONGODB ////////////////////
mongoose.connect(
  "mongodb+srv://" + process.env.DB_USER_PASS + "@clusterpekocko.kqgeq.mongodb.net/databasePekocko?retryWrites=true&w=majority",
  { useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

//////////////////// CORS HEADERS - PERMET LA COMMUNICATION ENTRE LES LOCALHOST 3000/4200 ////////////////////
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

//////////////////// MISE EN PLACE DE COOKIE-SESSION ////////////////////
let expiryDate = new Date( Date.now() + 60 * 60 * 1000 ); // expiration dans 1 heure
app.use(session({
  name: 'session',
  keys: [process.env.COOKIESECRET], // .env pour voir la clé secrète
  cookie: { secure: false, // Si HTTPS mettre " True "
            httpOnly: true, // booléen indiquant si le cookie doit être envoyé uniquement via HTTP(S)
            domain: 'http://localhost:3000', // Domaine du cookie
            path: '/', // chemin du cookie
            expires: expiryDate // Date d'expiration du cookie
          }
  })
);

//////////////////// LIMITE LES REQUÊTES ////////////////////
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limiter chaque IP à 100 requêtes
});
// Fonctionne sur toutes les requêtes
app.use(limiter);

//////////////////// GÈRER LES RESSOURCES IMAGES DE MANIÈRES STATIQUES ////////////////////
app.use('/images', express.static(path.join(__dirname, 'images')));

//////////////////// LES ROUTES ////////////////////
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

//////////////////// EXPORT APP SUR TOUTE L'APP ////////////////////
module.exports = app;