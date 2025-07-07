const axios = require('axios');
const crypto = require('crypto');

// Supported Mail.cx domains
const MAIL_DOMAINS = ['qabq.com', 'nqmo.com', 'end.tw', 'uuf.me', '6n9.net'];

/**
 * Generates a random email using supported mail.cx domains
 * @returns {string} Random email address
 */
function generateRandomEmail() {
  const random = crypto.randomBytes(5).toString('hex');
  const domain = MAIL_DOMAINS[Math.floor(Math.random() * MAIL_DOMAINS.length)];
  return `${random}@${domain}`;
}

/**
 * Fetch inbox for a given Mail.cx email address
 * @param {string} email - The email address (e.g., abcd123@qabq.com)
 * @returns {Promise<Array>} List of emails (if any)
 */
async function fetchInbox(email) {
  const name = email.split('@')[0];
  const url = `https://api.mail.cx/mailbox/${name}`;

  try {
    const { data } = await axios.get(url);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('❌ Inbox fetch error:', err.message);
    return [];
  }
}

/**
 * Fetch full email content by ID
 * @param {string} email - The email address
 * @param {string} id - Message ID
 * @returns {Promise<Object|null>} Full email data or null on error
 */
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
};
