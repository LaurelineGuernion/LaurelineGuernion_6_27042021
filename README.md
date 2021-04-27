# So Peckocko
Projet 6 : création d’une API sécurisée pour une application d'avis gastronomiques


Application web permettant aux utilisateurs d’ajouter leurs sauces préférées et de liker/disliker les sauces ajoutées par les autres utilisateurs.

Git clone du backend : https://github.com/LaurelineGuernion/LaurelineGuernion_6_27042021.git

le frontend : https://github.com/OpenClassrooms-Student-Center/dwj-projet6

## LANCEMENT FRONT-END

cd frontend

npm install 

npm start (ou ng serve)

http://localhost:3000

## LANCEMENT BACK-END

cd backend

npm install

npm (ou npx) nodemon

#### Lancement de l’application : http://localhost:4200/login

## CONFIGURATION
Dans le dossier backend/config faire une fichier .en avec dedans :

DB_USER_PASS= … ?

TOKEN_SECRET= … ?

COOKIESECRET= … ?

Ajout de vos codes d’accès

## TECHNOLOGIES UTILISÉES

● framework : Express ;

● serveur : NodeJS ;

● base de données : MongoDB ;

● toutes les opérations de la base de données utilisent le pack Mongoose avec
des schémas de données stricts.

## EXIGENCES CONCERNANT LA SÉCURUTÉ

● l’API doit respecter le RGPD et les standards OWASP ;

● le mot de passe des utilisateurs doit être chiffré ;

● 2 types de droits administrateur à la base de données doivent être définis : un accès
pour supprimer ou modifier des tables, et un accès pour éditer le contenu de la base
de données ;

● la sécurité de la base de données MongoDB (à partir d’un service tel que MongoDB
Atlas) doit être faite de telle sorte que le validateur puisse lancer l’application depuis
sa machine ;

● l’authentification est renforcée sur les routes requises ;

● les mots de passe sont stockés de manière sécurisée ;

● les adresses mails de la base de données sont uniques et un plugin Mongoose
approprié est utilisé pour s’assurer de leur caractère unique et rapporter des erreurs.
