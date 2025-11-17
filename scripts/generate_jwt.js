const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'secret'; // change pour prod
const expiresIn = process.argv[2] || '1h'; // ex: "2h", "30m"
const payloadArg = process.argv[3]; // optionnel: JSON string pour le payload

let payload;
try {
  payload = payloadArg ? JSON.parse(payloadArg) : { id: 1, name: 'test' };
} catch (e) {
  console.error('Payload JSON invalide');
  process.exit(1);
}

const token = jwt.sign(payload, secret, { expiresIn });
console.log(token);