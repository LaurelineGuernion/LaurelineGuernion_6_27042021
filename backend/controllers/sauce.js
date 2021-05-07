const Sauce = require('../models/sauce');
// fs permet d'intéragir avec les fichiers
const fs = require('fs');

// Sécuriser les champs
const regexForm = /[^a-zA-ZÀ-ÿ-0-9-\s,.!()']+$/g;

//////////////////// CRÉATION DE LA SAUCE ////////////////////
exports.createSauce = (req, res, next) => {
  // Objet js sous forme de chaîne de caractères
  const sauceObject = JSON.parse(req.body.sauce);

  // Protection du formulaire avec un Regex pour interdire les caractères spéciaux
  if (sauceObject.name.match(regexForm) || sauceObject.manufacturer.match(regexForm) || sauceObject.description.match(regexForm) || sauceObject.mainPepper.match(regexForm)) {
      return res.status(400).json({ error: 'Les caractères spéciaux sont non autorisés !' });
  } else {
    // Sinon créer la sauce
      delete sauceObject._id;
      const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        // Remet les sauces aimées/detestées à 0, et usersliked/usersdislked en tableaux vides
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
      });
      sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistrée !'}))
        .catch(error => res.status(400).json({ error }));
    };
};

//////////////////// MODIFICATION DE LA SAUCE ////////////////////
exports.modifySauce = (req, res, next) => {
  // Si on trouve un fichier
  const sauceObject = req.file ?
  { // On récupère la chaîne de caractère
    ...JSON.parse(req.body.sauce),
    // et modifier image
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body }; // Sinon on prend le corps de la requête

  // Protection du formulaire avec un Regex pour interdire les caractères spéciaux
  if (sauceObject.name.match(regexForm) || sauceObject.manufacturer.match(regexForm) || sauceObject.description.match(regexForm) || sauceObject.mainPepper.match(regexForm)) {
    return res.status(400).json({ error: 'Les caractères spéciaux sont non autorisés !' });
  } else {
    // Sinon modification de la sauce
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
      .catch(error => res.status(400).json({ error }));
    };
};

//////////////////// SUPPRESSION DE LA SAUCE ////////////////////
exports.deleteSauce = (req, res, next) => {
  // Trouver l'objet dans la BDD
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => {
        // Extraire nom du fichier à supprimer
        const filename = sauce.imageUrl.split('/images/')[1];
        // suppression du fichier dans la BDD et dans le dossier /images
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
            .catch(error => res.status(400).json({ error }));
        });
      })
      .catch(error => res.status(500).json({ error }));
};

//////////////////// TABLEAUX DE TOUTES LES SAUCES ////////////////////
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

//////////////////// RÉCUPÉRATION D'UNE SEULE SAUCE GRACE AU ID ////////////////////
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
      .then(sauce => res.status(200).json(sauce))
      .catch(error => res.status(404).json({ error }));
};

//////////////////// LIKE/DISLIKE DES SAUCES ////////////////////
exports.likeDislikeSauce = (req, res, next) => {    
  const likeBody = req.body.like;
  const UserIdBody = req.body.userId;
  const idParams = req.params.id;

  // Liker la sauce
  if(likeBody == 1) { 
      Sauce.updateOne(
        { _id: idParams },
        // Utilisation des opérateurs Mongoose - https://docs.mongodb.com/manual/reference/operator/update/
        { $inc: { likes: +1 },
          $push: { usersLiked: UserIdBody }})
      .then( () => res.status(200).json({ message: 'Vous aimez la sauce !' }))
      .catch( error => res.status(400).json({ error}));
  } 
  
  // Disliker la sauce
  if(likeBody == -1) {
      Sauce.updateOne(
        { _id: idParams },
        { $inc: { dislikes: +1 },
          $push: { usersDisliked: UserIdBody }})
      .then( () => res.status(200).json({ message: "Vous n'aimez pas la sauce !" }))
      .catch( error => res.status(400).json({ error}));
  } 
  
  // Modifier dislike/like
  if (likeBody == 0) {
    Sauce.findOne(
      { _id: idParams })
    .then((sauce) => {
      let usersLikedTrouve = false;
      // Si l'id de l'utilisateur est trouvé dans le tableau usersLiked, cela veut dire qu'il a liké la sauce
      for (let i = 0; i < sauce.usersLiked.length; i++) {
        if (sauce.usersLiked[i] == UserIdBody) {
          usersLikedTrouve = true;
        }
      }
      // Si l'id de l'utilisateur n'est pas dans usersLiked, cela signifie qu'il n'a pas aimé la sauce, alors modifier like/dislike
      if (usersLikedTrouve == false) {
        Sauce.updateOne(
          { _id: idParams },
          { $pull: { usersDisliked: UserIdBody },
            $inc: { dislikes: -1 }})
          .then(() => res.status(200).json({ message: "Dislike en moins !" }))
          .catch((error) => res.status(400).json({ error }));
      } else {
        // Modifier le vote dans usersliked
        Sauce.updateOne(
          { _id: idParams },
          { $pull: { usersLiked: UserIdBody },
            $inc: { likes: -1 }})
          .then(() => res.status(200).json({ message: "Like en moins " }))
          .catch((error) => res.status(400).json({ error }));
      }
    });
  }
};