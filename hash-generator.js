// First, create a script to generate the hash (hash-generator.js)
const bcrypt = require('bcrypt');

async function generateHash(password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log(`Hashed password: ${hash}`);
}

generateHash('secureAdmin123#');  // For admin
generateHash('secureOfficer123#'); // For officer