

const crypto = require('crypto');
const fs = require('fs');


function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function main() {
  const inputFile = process.argv[2];
  
  if (!inputFile) {
    console.log('❌ Erreur: Vous devez spécifier un fichier');
    console.log('');
    console.log('Usage: node scripts/hash_passwords.js <fichier>');
    console.log('');
    console.log('Exemple:');
    console.log('  node scripts/hash_passwords.js data/users.json');
    console.log('');
    process.exit(1);
  }

  if (!fs.existsSync(inputFile)) {
    console.log(`❌ Erreur: Le fichier "${inputFile}" n'existe pas`);
    process.exit(1);
  }


  try {
    let users;
    const fileContent = fs.readFileSync(inputFile, 'utf8');
    
    if (inputFile.endsWith('.js')) {
      // Pour les fichiers .js, on utilise require directement
      const path = require('path');
      const absolutePath = path.resolve(inputFile);
      delete require.cache[absolutePath]; // Force le reload
      users = require(absolutePath);
    } else {
      users = JSON.parse(fileContent);
    }

    if (!Array.isArray(users)) {
      process.exit(1);
    }


    const hashedUsers = users.map(user => {
      if (!user.password) {
        return user;
      }

      const { salt, hash } = hashPassword(user.password);
    
      delete user.password;
      
      return {
        ...user,
        passwordHash: hash,
        passwordSalt: salt
      };
    });

    const baseFileName = inputFile.replace(/\.(js|json)$/, '');
    const outputJsonFile = baseFileName + '_hashed.json';
    const outputJsFile = baseFileName + '_hashed.js';
    
    fs.writeFileSync(outputJsonFile, JSON.stringify(hashedUsers, null, 2), 'utf8');
    
    const jsContent = `
    
let mockUserDB = ${JSON.stringify(hashedUsers, null, 2)};

module.exports = mockUserDB;
`;
    fs.writeFileSync(outputJsFile, jsContent, 'utf8');
    

  } catch (error) {
    process.exit(1);
  }
}

main();
