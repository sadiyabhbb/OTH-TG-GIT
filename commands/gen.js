const { ADMIN_UID, ADMIN_USERNAME } = require('../config/botConfig');
const { loadDB } = require('../utils/db');
const { generateValidCard, getBinInfo, createCCMessage } = require('../utils/cardUtils');

module.exports = (bot) => {
  const userDB = loadDB();

  // 🔹 Traditional /gen command
  bot.onText(/\/gen (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (userId !== ADMIN_UID && !userDB.approved.includes(userId)) {
      return bot.sendMessage(chatId, `⛔ You are not approved to use this bot.\nAsk @${ADMIN_USERNAME} for access.`);
    }

    const bin = match[1].trim().replace(/\D/g, '');
    if (!/^\d{6,}$/.test(bin)) {
      return bot.sendMessage(chatId, "⚠️ Please enter a valid BIN (6+ digits)\nExample: /gen 515462");
    }

    const cards = Array.from({ length: 10 }, () => generateValidCard(bin));
    const binInfo = await getBinInfo(bin.substring(0, 8));
    const message = createCCMessage(bin, binInfo, cards);

    await bot.sendMessage(chatId, message.text, message.options);
  });
};

// ✅ Callback support: Ask user to enter BIN
module.exports.runGenInline = async (bot, chatId) => {
  await bot.sendMessage(chatId, '💳 দয়া করে একটি BIN দিন:\n\nউদাহরণ:\n`/gen 515462`', {
    parse_mode: 'Markdown'
  });
};
