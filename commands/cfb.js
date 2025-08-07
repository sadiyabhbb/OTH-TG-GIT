const axios = require('axios');
const faker = require('@faker-js/faker').faker;
const { createHash } = require('crypto');

module.exports = (bot) => {
  bot.onText(/^\/cfb(?: (.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const input = match[1] || "";

    const prefix = input.trim() || "likhon420x";
    const emailLocal = `${prefix}${Math.random().toString(36).substring(2, 7)}`;
    const email = `${emailLocal}@gmail.com`;

    // Random info
    const fullName = faker.person.fullName();
    const password = faker.internet.password({ length: 10 });
    const dob = faker.date.birthdate({ min: 18, max: 25, mode: 'age' });
    const dobStr = `${dob.getDate()}/${dob.getMonth()+1}/${dob.getFullYear()}`;
    const phone = faker.phone.number('01#########');

    const accountData = {
      email,
      password,
      name: fullName,
      phone,
      dob: dobStr
    };

    const responseText = `
🔐 *FB Account Ready*

👤 Name: \`${accountData.name}\`  
📧 Email: \`${accountData.email}\`  
🔑 Password: \`${accountData.password}\`  
📱 Phone: \`${accountData.phone}\`  
🎂 DOB: \`${accountData.dob}\`

⚠️ *Note:* Account created up to verification step. Manually enter confirmation code.
    `;

    bot.sendMessage(chatId, responseText, { parse_mode: 'Markdown' });
  });
};
