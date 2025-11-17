# Hack Ton Pote (Equipe 2)
 
Nom du projet : Hack Ton Pote
 
Membres :
- BESSON Baptiste
- FUERTES Bryce
- LACOUR Hippolyte
- STRAPUTICARI Luca
 
# 1. Exigences (Requirements)
 
Cette section décrit les prérequis pour exécuter le projet, comment vérifier que tout est présent, et des instructions d'installation pour Windows, Linux et macOS.
 
## 1.1 Pré-requis logiciel
 
- Node.js (version LTS recommandée, par ex. >= 16). Le projet utilise `nodemon` en script de démarrage (voir `package.json`).
- npm (fourni avec Node.js) ou yarn
- Navigateur web (pour accéder à la documentation Swagger)
 
Le projet n'utilise pas de base de données externe (utilise `mockDB/`), donc il n'y a pas de configuration de base de données à faire.
 
## 1.2 Comment vérifier les pré-requis
 
Ouvrez un terminal et exécutez :
 
```
node -v
```
 
```
npm -v
```
 
Si les commandes renvoient des versions valides (par ex. `v16.x`, `v18.x`), les prérequis sont satisfaits.
 
## 1.3 Installation par système d'exploitation
 
Remarque : les commandes ci-dessous sont des exemples ; adaptez-les selon votre gestionnaire de paquets préféré.
 
### Windows
 
1. Installer Node.js (LTS) :
 
    - Option graphique : téléchargez l'installateur LTS depuis https://nodejs.org et installez-le.
    - Option en ligne de commande (Windows 10/11) :
 
```
winget install OpenJS.NodeJS.LTS -e
```
 
2. installer les dépendances :
 
```
cd htp
npm install
```
 
3. Démarrer l'application :
 
```
npm start
```
 
Note : le script `token` dans `package.json` utilise une syntaxe Windows (`node .\\scripts\\generate_jwt.js`) et fonctionnera sur Windows avec `npm run token`. Sur macOS/Linux, utilisez plutôt :
 
```
node ./scripts/generate_jwt.js
```
Swagger UI : http://localhost:3000/api-docs
 
### Linux (Debian/Ubuntu)
 
1. Installer Node.js (ex. Node 18 LTS) :
 
```
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```
 
2. Cloner et installer :
 
```
git clone <URL_DU_REPO>
cd htp
npm install
```
 
4. Démarrer :
 
```
npm start
# ou si vous préférez sans nodemon
node server.js
```
 
### Fedora / CentOS (DNF)
 
```
sudo dnf install -y nodejs
git clone <URL_DU_REPO>
cd htp
npm install
npm start
```
 
### macOS
 
1. Avec Homebrew :
 
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"  # si brew absent
brew install node
```
 
2. Cloner et installer :
 
```
git clone <URL_DU_REPO>
cd htp
npm install
npm start
```
 
3. Alternative : utiliser `nvm` pour gérer les versions de Node :
 
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
# redémarrer le terminal, puis :
nvm install --lts
nvm use --lts
```
 
## 1.4 Démarrage et vérification post-installation
 
1. Démarrez le serveur :
 
```
npm start
```
 
Le projet écoute par défaut sur le port 3000 (voir `server.js`).
 
2. Vérifications simples :
 
- Page de la documentation OpenAPI / Swagger : ouvrir dans le navigateur :
 
```
http://localhost:3000/api-docs
```
 
- Exemple d'API : obtenir la liste des livres (v1) :
 
```
curl http://localhost:3000/api/v1/books
```
 
Si vous obtenez une réponse JSON ou la page Swagger, le serveur fonctionne correctement.
 
## 1.5 Commandes utiles
 
- Installer les dépendances : `npm install`
- Démarrer en mode développement (avec nodemon) : `npm start` (par défaut défini dans `package.json` : `nodemon server.js`).
- Lancer sans nodemon : `node server.js`
- Générer un token JWT (Windows) : `npm run token` ; (macOS/Linux) : `node ./scripts/generate_jwt.js`.
 
## 1.6 Dépannage rapide
 
- Si `npm start` échoue parce que `nodemon` n'est pas trouvé, exécutez `npm install` pour installer les dépendances (devDependencies incluses).
- Si le port 3000 est déjà utilisé : fermer l'application qui occupe le port ou modifier le port dans `server.js`.
- Problèmes de chemin pour le script `token` sur macOS/Linux : exécuter `node ./scripts/generate_jwt.js` directement.
 
---
 
Si vous souhaitez que j'ajoute des instructions supplémentaires (par ex. Docker, variables d'environnement, ou un script cross-platform pour `token`), dites-le et je l'ajouterai.
