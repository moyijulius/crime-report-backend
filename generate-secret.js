const crypto = require('crypto');
const newSecret = crypto.randomBytes(64).toString('hex');
console.log(newSecret);