// utils/checkAccess.js
const { loadDB } = require('./db');
const { ADMIN_UID, ADMIN_USERNAME } = require('../config/botConfig');

function checkAccess(user) {
  const db = loadDB();
  const userId = user.id;
  const username = user.username || '';

  const isAdmin = (
    username.toLowerCase() === ADMIN_USERNAME.toLowerCase() ||
    userId.toString() === ADMIN_UID.toString()
  );
  const isApproved = db.approved.includes(userId);
  const isBanned = db.banned.includes(userId);
  const isPending = db.pending.includes(userId);

  return { isAdmin, isApproved, isBanned, isPending };
}

module.exports = checkAccess;
