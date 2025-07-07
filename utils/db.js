const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const path = './users.json';

// ✅ Local DB Load
function loadDB() {
  try {
    const data = fs.readFileSync(path, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { approved: [], pending: [], banned: [] };
  }
}

// ✅ Save both locally & to backup server
function saveDB(data) {
  // Save locally
  fs.writeFileSync(path, JSON.stringify(data, null, 2));

  // 🔄 Backup to external server (your Render drive server)
  const form = new FormData();
  form.append('file', Buffer.from(JSON.stringify(data, null, 2)), {
    filename: 'users.json',
    contentType: 'application/json'
  });

  axios.post('https://users-backup.onrender.com/upload', form, {
    headers: form.getHeaders()
  }).then(() => {
    console.log('✅ UserDB uploaded to backup server');
  }).catch((err) => {
    console.error('❌ Backup upload failed:', err.message);
  });
}

module.exports = { loadDB, saveDB };
