const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');

// Konfigurasi Bot
const BOT_CONFIG = {
  ADMIN_UID: 'YOUR_TELEGRAM_UID', // Ganti dengan UID Telegram Admin Anda
  ADMIN_USERNAME: 'YOUR_TELEGRAM_USERNAME' // Ganti dengan username Telegram Admin Anda
};

// Database Handler
const DB_PATH = path.join(__dirname, 'db.json');

const loadDB = () => {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch {
    return { 
      users: [],
      pending: [],
      approved: [BOT_CONFIG.ADMIN_UID], // Otomatis approve admin
      banned: [] 
    };
  }
};

const saveDB = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// Inisialisasi Bot
const bot = new Telegraf(process.env.BOT_TOKEN);

// Middleware untuk menangani semua pesan
bot.use(async (ctx, next) => {
  const userDB = loadDB();
  const userId = ctx.from?.id;
  
  if (!userId) return next(); // Skip jika bukan pesan user
  
  // Tambah user baru ke database jika belum ada
  if (!userDB.users.includes(userId)) {
    userDB.users.push(userId);
    saveDB(userDB);
  }
  
  return next();
});

// Handler untuk command /start
bot.command('start', (ctx) => {
  const userDB = loadDB();
  const userId = ctx.from.id;
  const username = ctx.from.username || 'NoUsername';
  const fullName = [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(' ');
  
  // Check admin
  const isAdmin = (userId.toString() === BOT_CONFIG.ADMIN_UID) || 
                 (username.toLowerCase() === BOT_CONFIG.ADMIN_USERNAME?.toLowerCase());
  
  // Check approval status
  const isApproved = userDB.approved.includes(userId);
  const isPending = userDB.pending.includes(userId);
  const isBanned = userDB.banned.includes(userId);

  // Handle banned users
  if (isBanned) {
    return ctx.reply('🚫 Anda dilarang menggunakan bot ini!');
  }

  // Admin welcome
  if (isAdmin) {
    return ctx.replyWithMarkdown(
      `👑 *Halo Admin ${fullName}!*\n` +
      `Anda memiliki akses penuh ke bot ini.`
    );
  }

  // Approved user welcome
  if (isApproved) {
    return ctx.replyWithMarkdown(
      `👋 *Halo ${fullName}!*\n` +
      `Selamat datang kembali di bot kami.`
    );
  }

  // New user request
  if (!isPending) {
    userDB.pending.push(userId);
    saveDB(userDB);
    ctx.replyWithMarkdown(
      `📩 *Permintaan Akses Dikirim*\n\n` +
      `Mohon tunggu persetujuan admin.`
    );
    
    // Kirim notifikasi ke admin
    ctx.telegram.sendMessage(
      BOT_CONFIG.ADMIN_UID,
      `🆕 Permintaan Akses Baru\n\n` +
      `User: ${fullName}\n` +
      `Username: @${username}\n` +
      `ID: ${userId}`
    );
  } else {
    ctx.replyWithMarkdown(
      `⏳ Permintaan akses Anda sedang diproses.`
    );
  }
});

// Handler untuk semua pesan non-command
bot.on('message', (ctx) => {
  if (ctx.message.text.startsWith('/')) return;
  
  const userDB = loadDB();
  const userId = ctx.from.id;
  
  const isAdmin = (userId.toString() === BOT_CONFIG.ADMIN_UID);
  const isApproved = userDB.approved.includes(userId);
  
  if (!isAdmin && !isApproved) {
    return ctx.replyWithMarkdown(
      `⚠️ *Akses Ditolak*\n\n` +
      `Silakan gunakan command /start untuk meminta akses.`
    );
  }
  
  // Lanjutkan ke handler berikutnya untuk user yang memiliki akses
  return next();
});

// Memulai bot
bot.launch().then(() => {
  console.log('Bot berhasil dijalankan!');
}).catch(err => {
  console.error('Gagal menjalankan bot:', err);
});

// Handle shutdown gracefully
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
