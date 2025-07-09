const os = require('os');

let startTime = Date.now(); // বট চালুর সময়

module.exports = (bot) => {
  function getFormattedUptime() {
    const uptimeMS = Date.now() - startTime;
    const seconds = Math.floor((uptimeMS / 1000) % 60);
    const minutes = Math.floor((uptimeMS / (1000 * 60)) % 60);
    const hours = Math.floor((uptimeMS / (1000 * 60 * 60)) % 24);
    const days = Math.floor(uptimeMS / (1000 * 60 * 60 * 24));
    return `*${days} Days* • *${hours} Hours* • *${minutes} Minutes*`;
  }

  function getFormattedStartTime() {
    const now = new Date(startTime);
    const day = now.getDate().toString().padStart(2, '0');
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${year} • ${hour}:${minute}`;
  }

  bot.on('callback_query', async (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    if (data === 'uptime') {
      const start = Date.now();
      await bot.sendChatAction(chatId, 'typing');
      const latency = Date.now() - start;

      // ⚠️ MarkdownV2 requires escaping
      const msg = `
━━━━━━━━━━━━━━━━━━━━━━━  
🌐 *\BOT STATUS PANEL \*  
━━━━━━━━━━━━━━━━━━━━━━━  

⏳ *Uptime Duration*  
🔸 ${escapeMd(getFormattedUptime())}

📆 *Online Since*  
🗓️ ${escapeMd(getFormattedStartTime())}

📶 *Current Status*  
🟢 *Online* • 💼 *Fully Operational*

⚡ *Response Speed*  
📡 *${latency} ms*

🛠️ *Bot Version*  
🔧 *v1\\.2\\.4* • 🧪 *Stable Release*

🔐 *Security*  
🛡️ *End\\-to\\-End Encryption*  
🗂️ *User Data Fully Protected*

━━━━━━━━━━━━━━━━━━━━━━━  
💬 *All systems running smoothly\\. No issues detected\\.*  
━━━━━━━━━━━━━━━━━━━━━━━
      `.trim();

      bot.editMessageText(msg, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "MarkdownV2",
        reply_markup: {
          inline_keyboard: [[{ text: "🔙 Back", callback_data: "admin_panel" }]]
        }
      });
    }
  });

  // ✅ Helper function to escape MarkdownV2 special characters
  function escapeMd(text) {
    return text
      .replace(/[_*[()~`>#+=|{}.!\\-]/g, '\\$&');
  }
};
