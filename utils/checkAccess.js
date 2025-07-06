// utils/checkAccess.js

const { ADMIN_UID, ADMIN_USERNAME } = require('../config/botConfig');
const { loadDB } = require('./db');

function checkAccess(userId, username) {
  const db = loadDB();

  const isAdmin = (
    username?.toLowerCase() === ADMIN_USERNAME?.toLowerCase() ||
    userId.toString() === ADMIN_UID.toString()
  );

  const isApproved = db.approved.includes(userId);

  return { isAdmin, isApproved };
}

module.exports = checkAccess;
