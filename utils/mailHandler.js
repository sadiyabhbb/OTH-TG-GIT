const axios = require('axios');
const crypto = require('crypto');

// ✅ Latest domains from Mail.cx (TempMail.Ninja)
const validDomains = ['qabq.com', 'nqmo.com', 'end.tw', 'uuf.me', '6n9.net'];

// 🔁 Random domain and hex name
function generateRandomEmail() {
  const randomName = crypto.randomBytes(5).toString('hex');
  const domain = validDomains[Math.floor(Math.random() * validDomains.length)];
  return `${randomName}@${domain}`;
}

// 📥 Fetch inbox using only prefix (API doesn't take domain)
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

// 📬 Fetch full email
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
  fetchFullEmail,
  validDomains
};
