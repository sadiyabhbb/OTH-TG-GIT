const axios = require('axios');
const crypto = require('crypto');

const domains = ['qabq.com', 'nqmo.com', 'end.tw', 'uuf.me', '6n9.net'];

function generateRandomEmail() {
  const random = crypto.randomBytes(5).toString('hex');
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${random}@${domain}`;
}

async function fetchInbox(email) {
  const [name, domain] = email.split('@');
  const url = `https://api.mail.cx/mailbox/${name}?domain=${domain}`;
  try {
    const { data } = await axios.get(url);
    return data || [];
  } catch (err) {
    console.error('❌ Inbox fetch error:', err.message);
    return [];
  }
}

async function fetchFullEmail(email, id) {
  const [name, domain] = email.split('@');
  const url = `https://api.mail.cx/mailbox/${name}/${id}?domain=${domain}`;
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
