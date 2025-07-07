const axios = require('axios');
const crypto = require('crypto');

const DOMAINS = ['qabq.com', 'nqmo.com', 'end.tw', 'uuf.me', '6n9.net'];

function generateRandomEmail() {
  const random = crypto.randomBytes(5).toString('hex');
  const domain = DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
  return `${random}@${domain}`;
}

async function fetchInbox(email) {
  const name = email.split('@')[0];
  const url = `https://api.mail.cx/mailbox/${name}`;
  try {
    const res = await axios.get(url);
    if (Array.isArray(res.data)) {
      return res.data;
    } else {
      return [];
    }
  } catch (err) {
    console.error('❌ Inbox fetch error:', err.message);
    return [];
  }
}

async function fetchFullEmail(email, id) {
  const name = email.split('@')[0];
  const url = `https://api.mail.cx/mailbox/${name}/${id}`;
  try {
    const res = await axios.get(url);
    return res.data;
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
