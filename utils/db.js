const axios = require('axios');
const BACKUP_API = 'https://users-backup.onrender.com/users.json'; // Static JSON endpoint
const SAVE_API = 'https://users-backup.onrender.com/upload'; // File upload endpoint

async function loadDB() {
  try {
    const { data } = await axios.get(BACKUP_API);
    return data || { approved: [], pending: [], banned: [] };
  } catch (error) {
    console.error('❌ LoadDB Error:', error.message);
    return { approved: [], pending: [], banned: [] };
  }
}

const fs = require('fs');
const FormData = require('form-data');

async function saveDB(data) {
  try {
    fs.writeFileSync('./users.json', JSON.stringify(data, null, 2));

    const form = new FormData();
    form.append('file', fs.createReadStream('./users.json'));

    await axios.post(SAVE_API, form, {
      headers: form.getHeaders()
    });

    console.log('✅ DB backed up remotely');
  } catch (error) {
    console.error('❌ SaveDB Error:', error.message);
  }
}

module.exports = { loadDB, saveDB };
