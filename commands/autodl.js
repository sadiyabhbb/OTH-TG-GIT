const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// 🔄 Animation bar for Telegram
const showProgressBar = async (bot, chatId) => {
  const steps = [
    "🔄 LOADING...\n[█▒▒▒▒▒▒▒▒▒]",
    "🔄 LOADING...\n[███▒▒▒▒▒▒▒]",
    "🔄 LOADING...\n[█████▒▒▒▒▒]",
    "🔄 LOADING...\n[███████▒▒▒]",
    "🔄 LOADING...\n[████████▒▒]",
    "🔄 LOADING...\n[██████████]",
    "✅ LOADED!\n[██████████]"
  ];

  const sent = await bot.sendMessage(chatId, steps[0]);
  for (let i = 1; i < steps.length; i++) {
    await new Promise((res) => setTimeout(res, 300));
    await bot.editMessageText(steps[i], {
      chat_id: chatId,
      message_id: sent.message_id,
    });
  }
  await bot.deleteMessage(chatId, sent.message_id);
};

module.exports = (bot) => {
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text) return;

    const validLinks = [
      "https://vt.tiktok.com", "https://www.tiktok.com/",
      "https://www.facebook.com", "https://www.instagram.com/",
      "https://youtu.be/", "https://youtube.com/",
      "https://x.com/", "https://twitter.com/",
      "https://vm.tiktok.com", "https://fb.watch",
      "https://pin.it/"
    ];

    if (validLinks.some(link => text.startsWith(link))) {
      try {
        await showProgressBar(bot, chatId);

        const apiBase = (await axios.get(`https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`)).data.api;
        const response = await axios.get(`${apiBase}/alldl?url=${encodeURIComponent(text)}`);
        const result = response.data.result;

        const ext = result.includes(".jpg") ? ".jpg"
                  : result.includes(".png") ? ".png"
                  : result.includes(".jpeg") ? ".jpeg"
                  : ".mp4";

        const caption = ext === ".mp4" ? "🎥 Video Downloaded:" : "🖼️ Image Downloaded:";

        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir, { recursive: true });
        }

        const filePath = path.join(cacheDir, `file${ext}`);
        const file = await axios.get(result, { responseType: "arraybuffer" });
        fs.writeFileSync(filePath, Buffer.from(file.data, "binary"));

        if (ext === ".mp4") {
          await bot.sendVideo(chatId, filePath, {
            caption,
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "𝐑 𝐈 𝐇 𝐀 𝐃 🐻‍❄️", url: "https://t.me/rx_rihad" },
                  { text: "𝐆𝐑𝐎𝐔𝐏", url: "https://t.me/likhon_premium" }
                ]
              ]
            }
          });
        } else {
          await bot.sendDocument(chatId, filePath, { caption });
        }

        fs.unlinkSync(filePath);

      } catch (err) {
        console.error("❌ Error downloading file:", err.message);
        await bot.sendMessage(chatId, "❌ Download failed: " + err.message);
      }
    }
  });
};
