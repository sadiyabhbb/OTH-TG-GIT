   const { Telegraf } = require('telegraf');
   const { ADMIN_UID, ADMIN_USERNAME } = require('./config/botConfig');
   const { loadDB, saveDB } = require('./utils/db');
   
   const bot = new Telegraf(process.env.BOT_TOKEN);
   
   // ডাটাবেস ইন্সট্যান্স
   let userDB = loadDB();
   
   // মিডলওয়্যার
   bot.use(async (ctx, next) => {
     const userId = ctx.from.id;
     const username = ctx.from.username || 'NoUsername';
     
     // নতুন ইউজার হলে ডাটাবেসে অ্যাড
     if (!userDB.users.includes(userId)) {
       userDB.users.push(userId);
       saveDB(userDB);
     }
     
     await next();
   });
   
   // সকল মেসেজ হ্যান্ডলার
   bot.on('message', async (ctx) => {
     const userId = ctx.from.id;
     const chatId = ctx.chat.id;
     const messageText = ctx.message.text;
     const username = ctx.from.username || 'NoUsername';
     const fullName = `${ctx.from.first_name || ''} ${ctx.from.last_name || ''}`.trim();
     
     // ADMIN চেক
     const isAdmin = username.toLowerCase() === ADMIN_USERNAME.toLowerCase() || 
                     userId.toString() === ADMIN_UID.toString();
     
     // APPROVED চেক
     const isApproved = userDB.approved.includes(userId);
     
     // BANNED চেক
     if (userDB.banned.includes(userId)) {
       return await ctx.reply('🚫 You are banned from using this bot!');
     }
     
     // START কমান্ড হ্যান্ডেল
     if (messageText === '/start') {
       if (isAdmin) {
         return await ctx.replyWithMarkdown(`👑 *Welcome Admin ${fullName}!*`);
       }
       
       if (isApproved) {
         return await ctx.replyWithMarkdown(`👋 *Welcome ${fullName}!*`);
       }
       
       if (!userDB.pending.includes(userId)) {
         userDB.pending.push(userId);
         saveDB(userDB);
       }
       
       return await ctx.replyWithMarkdown(
         `⛔ *Access Restricted*\n\nPlease contact @${ADMIN_USERNAME} for access.`
       );
     }
     
     // অন্যান্য সব মেসেজের জন্য
     if (!isAdmin && !isApproved) {
       return await ctx.replyWithMarkdown(
         `⚠️ *Access Denied*\n\nSend /start to request access.`
       );
     }
     
     await next();
   });
   
   // বট স্টার্ট
   bot.launch();
   
