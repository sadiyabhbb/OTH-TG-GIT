const fs = require('fs');
const path = './users.json';

function loadDB() {
  try {
    const data = fs.readFileSync(path, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { approved: [], pending: [], banned: [] };
  }
}

function saveDB(data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

module.exports = { loadDB, saveDB };
