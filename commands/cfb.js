// File: commands/cfb.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const randomUseragent = require('random-useragent');
const fetch = require('node-fetch');

puppeteer.use(StealthPlugin());

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate() {
  return {
    day: randomInt(1, 28),
    month: randomInt(1, 12),
    year: randomInt(1985, 2003)
  };
}

function randomName() {
  const first = ["John", "Alex", "Michael", "Chris", "David", "James", "Robert", "Daniel"];
  const last = ["Smith", "Johnson", "Brown", "Williams", "Jones", "Miller", "Davis"];
  return `${first[randomInt(0, first.length - 1)]} ${last[randomInt(0, last.length - 1)]}`;
}

function randomEmail(prefix) {
  const chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
  let extra = '';
  for (let i = 0; i < 5; i++) extra += chars.charAt(randomInt(0, chars.length - 1));
  return `${prefix}${extra}@hotmail999.com`;
}

async function humanType(page, selector, text) {
  for (const ch of text) {
    await page.type(selector, ch, { delay: randomInt(100, 180) });
  }
}

async function humanMove(page) {
  await page.mouse.move(randomInt(0, 500), randomInt(0, 500));
  await new Promise(res => setTimeout(res, randomInt(300, 1000)));
}

async function createFacebookAccount(name, dob, email, password) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let uid = null;

  try {
    const page = await browser.newPage();
    await page.setUserAgent(randomUseragent.getRandom());
    await page.goto('https://www.facebook.com/reg', { waitUntil: 'networkidle2', timeout: 60000 });

    await humanMove(page);
    await humanType(page, 'input[name="firstname"]', name.split(' ')[0]);
    await humanType(page, 'input[name="lastname"]', name.split(' ')[1]);
    await humanType(page, 'input[name="reg_email__"]', email);
    await humanType(page, 'input[name="reg_passwd__"]', password);

    await page.select('select[name="birthday_day"]', dob.day.toString());
    await page.select('select[name="birthday_month"]', dob.month.toString());
    await page.select('select[name="birthday_year"]', dob.year.toString());

    await page.click(['input[value="1"]', 'input[value="2"]'][randomInt(0, 1)]);
    await humanMove(page);
    await page.click('button[name="websubmit"]');
    await new Promise(res => setTimeout(res, randomInt(5000, 9000)));

    const cookies = await page.cookies();
    const c_user = cookies.find(c => c.name === 'c_user');
    if (c_user) uid = c_user.value;

    return { email, password, name, dob, uid, status: "Waiting for confirmation code" };
  } catch (err) {
    console.error("Error creating Facebook account:", err);
    return null;
  } finally {
    await browser.close();
  }
}

async function getVerificationCode(email) {
  try {
    const res = await fetch(`https://hotmail999.com/api/get_mail.php?email=${encodeURIComponent(email)}`);
    const json = await res.json();
    if (json.status && json.data && json.data.length > 0) {
      const latest = json.data[0];
      if (latest.code) return latest.code;
    }
    return null;
  } catch (err) {
    console.error("Error fetching verification code:", err.message);
    return null;
  }
}

module.exports = (bot) => {
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text || "";

    if (!text.startsWith('/cfb')) return;

    const args = text.trim().split(/\s+/);
    if (args.length < 5) {
      return bot.sendMessage(chatId, "Usage: /cfb <number> - <password> - <mailPrefix>");
    }

    const count = parseInt(args[1]);
    if (isNaN(count) || count <= 0) {
      return bot.sendMessage(chatId, "❌ Invalid number of accounts.");
    }

    if (args[2] !== '-') {
      return bot.sendMessage(chatId, "❌ Format: /cfb <number> - <password> - <mailPrefix>");
    }

    const password = args[3];
    const prefix = args[5];
    let results = [];

    for (let i = 0; i < count; i++) {
      const name = randomName();
      const dob = randomDate();
      const email = randomEmail(prefix);

      await bot.sendMessage(chatId, `🔄 Creating account ${i + 1} → ${email}`);
      const acc = await createFacebookAccount(name, dob, email, password);

      if (!acc) {
        await bot.sendMessage(chatId, `❌ Failed: ${email}`);
        continue;
      }

      await bot.sendMessage(chatId, `⏳ Waiting for code: ${email}`);
      let code = null;
      for (let t = 0; t < 12; t++) {
        code = await getVerificationCode(email);
        if (code) break;
        await new Promise(r => setTimeout(r, 5000));
      }

      if (!code) {
        await bot.sendMessage(chatId, `❌ Code not found: ${email}`);
        results.push({ ...acc, code: null });
      } else {
        await bot.sendMessage(chatId, `✅ Code for ${email}: ${code}`);
        results.push({ ...acc, code });
      }
    }

    if (!results.length) return bot.sendMessage(chatId, "❌ No accounts created.");

    let summary = `🎉 Created ${results.length} account(s):\n\n`;
    results.forEach((r, i) => {
      summary += `#${i + 1}\n👤 ${r.name}\n📧 ${r.email}\n🔑 ${r.password}\n🎂 ${r.dob.day}/${r.dob.month}/${r.dob.year}\n🆔 ${r.uid}\n📨 ${r.code ?? "Not received"}\n\n`;
    });

    bot.sendMessage(chatId, summary);
  });
};
