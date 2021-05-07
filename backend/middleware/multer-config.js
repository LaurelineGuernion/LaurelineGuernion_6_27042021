const multer = require('multer');

//////////////////// GESTION DES FICHIERS ////////////////////
// Définir le format des images
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// Enregistrer sur le disque dans le dossier /images
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  // Quel nom de fichier utiliser ?
  filename: (req, file, callback) => {
    // Générer le nom : éviter les espaces et les remplacer par des underscores
    const name = file.originalname.split(' ').join('_');
    // Générer l'extension du fichier grace au MIME TYPES (dictionnaire)
    const extension = MIME_TYPES[file.mimetype];
    // Créer le nom du fichier
    callback(null, name + Date.now() + '.' + extension);
  }
});

module.exports = multer({storage: storage}).single('image');