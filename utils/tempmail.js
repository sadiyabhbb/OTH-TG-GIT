const axios = require('axios');
const cheerio = require('cheerio');

// 1. ডোমেইন লিস্ট
const TEMPMAIL_DOMAINS = [
  '@mailto.plus',
  '@fexpost.com',
  '@fexbox.org',
  '@mailbox.in.ua',
  '@rover.info',
];

// 2. API বেসড টেম্পমেইল চেক
async function checkByAPI(username) {
  for (const domain of TEMPMAIL_DOMAINS) {
    try {
      const email = `${username}${domain}`;
      const response = await axios.get(`https://api.tempmail.plus/v1/mails?email=${encodeURIComponent(email)}`);
      return response.data?.mail_list || [];
    } catch (error) {
      continue;
    }
  }
  return [];
}

// 3. স্ক্র্যাপিং বেসড টেম্পমেইল চেক
async function checkByScraping(username) {
  const email = `${username}@tempmail.plus`;
  try {
    const { data: html } = await axios.get(`https://tempmail.plus/en/#!/${email}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    const $ = cheerio.load(html);
    const mails = [];
    
    $('.mail_list .msg').each((i, el) => {
      mails.push({
        from: $(el).find('.from').text().trim(),
        subject: $(el).find('.subject').text().trim(),
        time: $(el).find('.time').text().trim(),
        preview: $(el).find('.msg_body').text().trim()
      });
    });
    
    return mails;
  } catch (error) {
    return [];
  }
}

// 4. মেইন ইউটিলিটি ফাংশন
module.exports = (bot) => {
  // API বেসড চেক
  bot.onText(/\/checkmail (.+)/, async (msg, match) => {
    const mails = await checkByAPI(match[1].trim());
    // রেসপন্স হ্যান্ডেলিং...
  });

  // স্ক্র্যাপিং বেসড চেক
  bot.onText(/\.tempmail (.+)/, async (msg, match) => {
    const mails = await checkByScraping(match[1].trim());
    // রেসপন্স হ্যান্ডেলিং...
  });
};
