const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const path = './users.json';

const BACKUP_URL = 'https://users-backup-1.onrender.com/uploads/users.json';
const BACKUP_UPLOAD = 'https://users-backup-1.onrender.com/upload'; // POST form-data (field: file)

function loadLocal() {
  try {
    const data = fs.readFileSync(path, 'utf8');
    return JSON.parse(data);
  } catch {
    return { approved: [], pending: [], banned: [] };
  }
}

async function loadDB() {
  try {
    const { data } = await axios.get(BACKUP_URL, { timeout: 5000 });
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
    return data;
  } catch (err) {
    console.warn('⚠️ Remote backup load failed. Using local DB.');
    return loadLocal();
  }
}

async function saveDB(data) {
  try {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));

    const form = new FormData();
    form.append('file', fs.createReadStream(path), 'users.json');

    await axios.post(BACKUP_UPLOAD, form, {
      headers: form.getHeaders(),
      timeout: 5000
    });

    console.log('✅ Backup uploaded to remote server.');
  } catch (err) {
    console.error('❌ Failed to save remote backup:', err.message);
  }
}

module.exports = { loadDB, saveDB };
