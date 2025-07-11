const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// 🔄 Animation bar
const showProgressBar = async () => {
  const steps = [
    "🔄 LOADING...\n[█▒▒▒▒▒▒▒▒▒]",
    "🔄 LOADING...\n[███▒▒▒▒▒▒▒]",
    "🔄 LOADING...\n[█████▒▒▒▒▒]",
    "🔄 LOADING...\n[███████▒▒▒]",
    "🔄 LOADING...\n[████████▒▒]",
    "🔄 LOADING...\n[██████████]",
    "✅ LOADED!\n[██████████]"
  ];
  for (const step of steps) {
    process.stdout.write(`\x1b[2K\r${step}`);
    await new Promise((r) => setTimeout(r, 300));
  }
  console.log("\n");
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
        await bot.sendMessage(chatId, "⏳ Downloading... Please wait");

        await showProgressBar(); // show CLI animation

        const apiBase = (await axios.get(`https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`)).data.api;
        const response = await axios.get(`${apiBase}/alldl?url=${encodeURIComponent(text)}`);
        const result = response.data.result;

        // শুধু mp4 হলে কাজ করবে
        if (!result.includes(".mp4")) {
          return bot.sendMessage(chatId, "❌ Only video (.mp4) links are supported.");
        }

        const caption = "🎥 Video Downloaded:";

        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir, { recursive: true });
        }

        const filePath = path.join(cacheDir, `file.mp4`);
        const file = await axios.get(result, { responseType: "arraybuffer" });
        fs.writeFileSync(filePath, Buffer.from(file.data, "binary"));

        await bot.sendVideo(chatId, filePath, { caption });

        fs.unlinkSync(filePath); // remove file after sending

      } catch (err) {
        console.error("❌ Error downloading file:", err.message);
        await bot.sendMessage(chatId, "❌ Download failed: " + err.message);
      }
    }
  });
};
