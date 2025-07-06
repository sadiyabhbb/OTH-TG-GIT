const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../users.json');

const loadDB = () => {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch {
    return {
      users: [],
      pending: [],
      approved: [],
      banned: [],
    };
  }
};

const saveDB = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

module.exports = (bot, config) => {
  bot.command('start', (ctx) => {
    const userDB = loadDB();
    const userId = ctx.from.id;
    const username = ctx.from.username || 'NoUsername';
    const fullName = [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(' ');

    const isAdmin =
      userId.toString() === config.ADMIN_UID ||
      (username && username.toLowerCase() === config.ADMIN_USERNAME?.toLowerCase());

    const isApproved = userDB.approved.includes(userId);
    const isPending = userDB.pending.includes(userId);
    const isBanned = userDB.banned.includes(userId);

    if (!userDB.users.includes(userId)) {
      userDB.users.push(userId);
    }

    if (isBanned) {
      return ctx.reply('🚫 আপনি এই বট ব্যবহার করতে নিষিদ্ধ!');
    }

    // ✅ Admin Panel
    if (isAdmin) {
      return ctx.replyWithMarkdown(
        `👑 *Admin Panel for @${username}*`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🧾 Users', callback_data: 'admin_users' }],
              [
                { text: '💳 Gen', callback_data: 'user_gen' },
                { text: '📩 TempMail', callback_data: 'user_tempmail' }
              ],
              [
                { text: '🔐 2FA', callback_data: 'user_2fa' },
                { text: '🕒 Uptime', callback_data: 'user_uptime' }
              ]
            ]
          }
        }
      );
    }

    // ✅ Approved User Panel
    if (isApproved) {
      return ctx.replyWithMarkdown(
        `👋 *স্বাগতম ${fullName}!*\nআপনার অ্যাক্সেস অনুমোদিত ✅`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '💳 Gen', callback_data: 'user_gen' },
                { text: '📩 TempMail', callback_data: 'user_tempmail' }
              ],
              [
                { text: '🔐 2FA', callback_data: 'user_2fa' },
                { text: '🕒 Uptime', callback_data: 'user_uptime' }
              ]
            ]
          }
        }
      );
    }

    // ⏳ Pending request
    if (!isPending) {
      userDB.pending.push(userId);
      saveDB(userDB);

      ctx.replyWithMarkdown(
        `📩 *অ্যাক্সেস অনুরোধ পাঠানো হয়েছে!*\nঅনুগ্রহ করে অ্যাডমিনের অনুমতির জন্য অপেক্ষা করুন।`
      );

      bot.sendMessage(
        config.ADMIN_UID,
        `🆕 *নতুন অ্যাক্সেস অনুরোধ*\n\n` +
          `👤 নাম: ${fullName}\n` +
          `🔗 ইউজারনেম: @${username}\n` +
          `🆔 UID: \`${userId}\``,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '✅ Approve', callback_data: `approve_${userId}` },
                { text: '❌ Ban', callback_data: `ban_${userId}` }
              ]
            ]
          }
        }
      );
    } else {
      ctx.replyWithMarkdown(`⏳ আপনার অনুরোধটি প্রক্রিয়াধীন রয়েছে...`);
    }

    saveDB(userDB);
  });

  // ✅ Handle all callback buttons (admin + user)
  bot.on('callback_query', async (query) => {
    const data = query.data;
    const userId = query.from.id.toString();
    const userDB = loadDB();

    const isAdmin = userId === config.ADMIN_UID;
    const isApproved = userDB.approved.includes(parseInt(userId));

    // ⚠️ Access control
    if (!isAdmin && !isApproved) {
      return bot.answerCallbackQuery(query.id, { text: '❌ Access denied' });
    }

    // 🔐 Admin Approve/Ban Buttons
    if (data.startsWith('approve_') || data.startsWith('ban_')) {
      if (!isAdmin) return bot.answerCallbackQuery(query.id, { text: 'Unauthorized' });

      const [, targetId] = data.split('_');
      const targetUid = parseInt(targetId);

      if (data.startsWith('approve_')) {
        if (!userDB.approved.includes(targetUid)) userDB.approved.push(targetUid);
        userDB.pending = userDB.pending.filter((id) => id !== targetUid);
        bot.sendMessage(targetUid, '✅ আপনার অ্যাক্সেস অনুমোদন করা হয়েছে!');
        bot.answerCallbackQuery(query.id, { text: 'User Approved ✅' });
      } else if (data.startsWith('ban_')) {
        if (!userDB.banned.includes(targetUid)) userDB.banned.push(targetUid);
        userDB.pending = userDB.pending.filter((id) => id !== targetUid);
        bot.sendMessage(targetUid, '🚫 আপনি নিষিদ্ধ হয়েছেন!');
        bot.answerCallbackQuery(query.id, { text: 'User Banned ❌' });
      }

      saveDB(userDB);
      return;
    }

    // 📦 User/Admin buttons
    switch (data) {
      case 'admin_users':
        if (!isAdmin) return bot.answerCallbackQuery(query.id, { text: 'Unauthorized' });
        return bot.sendMessage(userId, '👥 Showing users list...');

      case 'user_gen':
        return bot.sendMessage(userId, '⚙️ Generator panel...');
      case 'user_tempmail':
        return bot.sendMessage(userId, '📬 TempMail inbox...');
      case 'user_2fa':
        return bot.sendMessage(userId, '🔐 Two-factor authentication...');
      case 'user_uptime':
        return bot.sendMessage(userId, '🕒 Bot uptime info...');
      default:
        return bot.answerCallbackQuery(query.id, { text: 'Unknown action' });
    }
  });
};
