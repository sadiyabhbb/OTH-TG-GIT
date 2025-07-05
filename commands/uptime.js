const os = require('os');

let startTime = Date.now(); // বট চালু হওয়ার সময়

module.exports = (bot) => {
  bot.onText(/^\/?up$/, (msg) => {
    const chatId = msg.chat.id;
    const uptimeMS = Date.now() - startTime;

    const seconds = Math.floor((uptimeMS / 1000) % 60);
    const minutes = Math.floor((uptimeMS / (1000 * 60)) % 60);
    const hours = Math.floor((uptimeMS / (1000 * 60 * 60)) % 24);
    const days = Math.floor(uptimeMS / (1000 * 60 * 60 * 24));

    const uptimeText = `⏱️ *Bot Uptime:*\n${days}d ${hours}h ${minutes}m ${seconds}s`;

    bot.sendMessage(chatId, uptimeText, { parse_mode: "Markdown" });
  });
};
