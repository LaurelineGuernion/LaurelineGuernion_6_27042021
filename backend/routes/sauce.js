const express = require('express');
const router = express.Router();

const sauceCtrl = require('../controllers/sauce');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

//////////////////// ROUTES SAUCES - ENREGISTREMENT DANS LA BASE DE DONNÉES ////////////////////

// Envoyer les sauces dans la base de données
router.post('/', auth, multer, sauceCtrl.createSauce);

// Mise à jour de la sauce grace à l'id fourni
router.put('/:id', auth, multer, sauceCtrl.modifySauce);

// Supprimer la sauce de la base de données
router.delete('/:id', auth, sauceCtrl.deleteSauce);

// Tableaux des sauces
router.get('/', auth, sauceCtrl.getAllSauces);

// Sauce unique - renvoie la sauce avec l'Id fournit
router.get('/:id', auth, sauceCtrl.getOneSauce);

// Liker/disliker les sauces
router.post('/:id/like', auth, sauceCtrl.likeDislikeSauce);

module.exports = router;