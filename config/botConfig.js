require('dotenv').config();

module.exports = {
  ADMIN_UID: parseInt(process.env.ADMIN_UID),      // তোমার Telegram UID
  ADMIN_USERNAME: process.env.ADMIN_USERNAME       // তোমার Telegram username (without @)
};
