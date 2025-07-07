const axios = require('axios');
const crypto = require('crypto');

function generateRandomEmail() {
  const random = crypto.randomBytes(5).toString('hex');
  return `${random}@mail.cx`;
}

async function fetchInbox(email) {
  const name = email.split('@')[0];
  const url = `https://api.mail.cx/mailbox/${name}`;
  try {
    const { data } = await axios.get(url);
    return data || [];
  } catch (err) {
    console.error('❌ Inbox fetch error:', err.message);
    return [];
  }
}

async function fetchFullEmail(email, id) {
  const name = email.split('@')[0];
  const url = `https://api.mail.cx/mailbox/${name}/${id}`;
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (err) {
    console.error('❌ Mail body fetch error:', err.message);
    return null;
  }
}

module.exports = {
  generateRandomEmail,
  fetchInbox,
  fetchFullEmail
};
