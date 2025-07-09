const os = require('os');

let startTime = Date.now(); // বট চালুর সময় স্টোর

function escapeMarkdown(text) {
  return text.replace(/([_*()~`>#+\-=|{}.!\)/g, '\\$1');
}

module.exports = (bot) => {
  bot.on('callback_query', async (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    if (data === 'uptime') {
      const now = Date.now();
      const uptimeMS = now - startTime;

      const seconds = Math.floor((uptimeMS / 1000) % 60);
      const minutes = Math.floor((uptimeMS / (1000 * 60)) % 60);
      const hours = Math.floor((uptimeMS / (1000 * 60 * 60)) % 24);
      const days = Math.floor(uptimeMS / (1000 * 60 * 60 * 24));

      const bootDate = new Date(startTime);
      const bootTimeFormatted = bootDate.toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' });

      const memTotal = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
      const memFree = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
      const memUsed = (memTotal - memFree).toFixed(2);

      const cpuCores = os.cpus().length;
      const platform = os.platform();
      const arch = os.arch();
      const nodeVersion = process.version;

      const pingStart = Date.now();
      await bot.answerCallbackQuery(query.id);
      const ping = Date.now() - pingStart;

      const text = escapeMarkdown(`━━━━━━━━━━━━━━━━━━━━━━━  
🌐 *[ BOT STATUS PANEL ]*  
━━━━━━━━━━━━━━━━━━━━━━━

⏳ *Uptime Duration*  
🔸 ${days} Days • ${hours} Hours • ${minutes} Minutes

📆 *Online Since*  
🗓️ ${bootTimeFormatted}

📶 *Current Status*  
🟢 Online • 💼 Fully Operational

⚡ *Response Speed*  
📡 ${ping} ms (Average Ping)

🛠️ *Bot Info*  
🔧 Node ${nodeVersion} • 🧠 ${cpuCores} Cores • 🖥 ${arch}

📈 *RAM Usage*  
📉 ${memUsed} GB Used / ${memTotal} GB Total

━━━━━━━━━━━━━━━━━━━━━━━  
💬 All systems running smoothly\\.  
━━━━━━━━━━━━━━━━━━━━━━━`);

      bot.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'MarkdownV2',
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔙 Back", callback_data: "admin_panel" }]
          ]
        }
      });
    }
  });
};
