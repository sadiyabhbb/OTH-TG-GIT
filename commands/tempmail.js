const { generateRandomEmail, fetchInbox, fetchFullEmail } = require('../utils/mailcxHandler');
const { Markup } = require('telegraf');

const tempMailSessions = {}; // User session

module.exports = (bot) => {
  bot.command('tempmail', async (ctx) => {
    const userId = ctx.from.id;

    // নতুন ইমেইল জেনারেট করে সেট করি
    const email = generateRandomEmail();
    tempMailSessions[userId] = {
      email,
      count: 0,
    };

    await ctx.replyWithHTML(
      `📩 <b>TempMail Ready:</b>\n<code>${email}</code>\n\n🔄 প্রতি ৩০স পর inbox auto-refresh হবে (Max 5 বার)...`,
      Markup.inlineKeyboard([
        [Markup.button.callback('🔄 Refresh Now', 'refresh_mail')],
      ])
    );

    autoRefresh(ctx, userId);
  });

  bot.action('refresh_mail', async (ctx) => {
    const userId = ctx.from.id;
    await ctx.answerCbQuery();

    if (!tempMailSessions[userId]) {
      return ctx.reply('❗ প্রথমে `.tempmail` চালাও!');
    }

    const email = tempMailSessions[userId].email;
    const inbox = await fetchInbox(email);

    if (!inbox.length) {
      return ctx.replyWithHTML(`📥 টেম্পমেইল: <code>${email}</code>\n❌ <b>কোন মেইল পাওয়া যায়নি!</b>`);
    }

    const latest = inbox[0];
    const full = await fetchFullEmail(email, latest.id);
    const body = full?.text || full?.html || '(কোনো কন্টেন্ট পাওয়া যায়নি)';

    ctx.replyWithHTML(`📥 <b>টেম্পমেইল:</b> <code>${email}</code>\n\n🆔 <b>From:</b> ${latest.from}\n✉️ <b>Subject:</b> ${latest.subject}\n\n<pre>${body.trim()}</pre>`);
  });
};

function autoRefresh(ctx, userId) {
  const interval = setInterval(async () => {
    if (!tempMailSessions[userId]) return clearInterval(interval);

    tempMailSessions[userId].count += 1;
    if (tempMailSessions[userId].count > 4) {
      delete tempMailSessions[userId];
      clearInterval(interval);
      return;
    }

    const email = tempMailSessions[userId].email;
    const inbox = await fetchInbox(email);

    if (inbox.length > 0) {
      const latest = inbox[0];
      const full = await fetchFullEmail(email, latest.id);
      const body = full?.text || full?.html || '(কোনো কন্টেন্ট পাওয়া যায়নি)';

      ctx.replyWithHTML(`📥 <b>টেম্পমেইল:</b> <code>${email}</code>\n\n🆔 <b>From:</b> ${latest.from}\n✉️ <b>Subject:</b> ${latest.subject}\n\n<pre>${body.trim()}</pre>`);
      clearInterval(interval);
      delete tempMailSessions[userId];
    }
  }, 30000); // ৩০ সেকেন্ড পরপর
}
