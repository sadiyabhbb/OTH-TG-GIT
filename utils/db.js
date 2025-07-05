const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'users.json');
let userDB = { approved: [], pending: [], banned: [] };

if (fs.existsSync(DB_PATH)) {
  userDB = JSON.parse(fs.readFileSync(DB_PATH));
}

function saveDB() {
  fs.writeFileSync(DB_PATH, JSON.stringify(userDB, null, 2));
}

module.exports = { userDB, saveDB };
