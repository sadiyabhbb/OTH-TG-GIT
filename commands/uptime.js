const os = require('os');

let startTime = Date.now();

module.exports = (bot) => {
  bot.on('callback_query', async (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    if (data === 'uptime') {
      const now = new Date();
      const uptimeMS = Date.now() - startTime;
      const totalSeconds = Math.floor(uptimeMS / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);

      const formattedDate = now.toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
      const formattedTime = now.toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit'
      });

      const pingStart = Date.now();
      await bot.answerCallbackQuery(query.id);
      const ping = Date.now() - pingStart;

      const text = `
━━━━━━━━━━━━━━━━━━━━━━━  
🤖✨⟦ 𝐗𝟐𝟎 𝐏 - 𝐁𝐎𝐓 𝐔𝐏𝐓𝐈𝐌𝐄 ⟧✨🧸  
━━━━━━━━━━━━━━━━━━━━━━━  
🎴 𝐔𝐏𝐓𝐈𝐌𝐄 𝐌𝐎𝐍𝐈𝐓𝐎𝐑𝐈𝐍𝐆 ⚤︎  
⏳ *${days} 𝐃 : ${hours} 𝐇 : ${minutes} 𝐌*

📆 𝐓𝐎𝐃𝐀𝐘'𝐒 𝐃𝐀𝐓𝐄 & 𝐓𝐈𝐌𝐄  
🗓️ *${formattedDate}* 🕒 *${formattedTime}*

📶 𝐁𝐎𝐓 𝐒𝐓𝐀𝐓𝐔𝐒  
🟢 *Online & Stable*

⚡ 𝐏𝐈𝐍𝐆 𝐒𝐏𝐄𝐄𝐃  
📡 *${ping} ms*

🛠️ 𝐁𝐎𝐓 𝐕𝐄𝐑𝐒𝐈𝐎𝐍  
🔧 *v1.2.4* • 🧪 *Stable Release*

🔐 𝐏𝐑𝐎 𝐒𝐄𝐂𝐔𝐑𝐈𝐓𝐘  
🛡️ *HARD - CORE PROTECTION*

━━━━━━━━━━━━━━━━━━━━━━━  
💬 𝐁𝐎𝐓 𝐁𝐘 ⟦ 𝐑 𝐈 𝐇 𝐀 𝐃 🐻‍❄️ ⟧  
━━━━━━━━━━━━━━━━━━━━━━━`;

      bot.editMessageText(text, {
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
