const os = require('os');

let startTime = Date.now(); // বট চালুর সময় স্টোর

module.exports = (bot) => {
  function getFormattedUptime() {
    const uptimeMS = Date.now() - startTime;

    const seconds = Math.floor((uptimeMS / 1000) % 60);
    const minutes = Math.floor((uptimeMS / (1000 * 60)) % 60);
    const hours = Math.floor((uptimeMS / (1000 * 60 * 60)) % 24);
    const days = Math.floor(uptimeMS / (1000 * 60 * 60 * 24));

    return `⏱️ *Bot Uptime:*\n${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  // /up or up command
  bot.onText(/^\/?up$/, (msg) => {
    const chatId = msg.chat.id;
    const uptimeText = getFormattedUptime();

    bot.sendMessage(chatId, uptimeText, {
      parse_mode: "Markdown"
    });
  });

  // Uptime button via callback
  bot.on('callback_query', (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    if (data === 'uptime') {
      const uptimeText = getFormattedUptime();

      bot.editMessageText(uptimeText, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔙 Back", callback_data: "admin_panel" }]
          ]
        }
      });
    }
  });
};
