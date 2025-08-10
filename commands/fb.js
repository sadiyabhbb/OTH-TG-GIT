// File: commands/fb.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const randomUseragent = require('random-useragent');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

// Read proxy list (ভারতের প্রোক্সি ধরে নিন proxy.txt-তে আছে)
function getProxies() {
  const file = path.join(__dirname, 'proxy.txt');
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf-8').split(/\r?\n/).filter(Boolean);
}

// Serial email generator
function serialEmail(prefix, index) {
  return `${prefix}${String(index + 1).padStart(2, '0')}@hotmail999.com`;
}

// Random date of birth generator
function randomDate() {
  return {
    day: Math.floor(Math.random() * 28) + 1,
    month: Math.floor(Math.random() * 12) + 1,
    year: Math.floor(Math.random() * (2003 - 1985 + 1)) + 1985
  };
}

// Random Bangladeshi female names in English
function randomName() {
  const first = [
    "Ayesha", "Sara", "Mehzabin", "Nusrat", "Safia",
    "Mona", "Ruksana", "Jannat", "Shabnur", "Nadia"
  ];
  const last = [
    "Karim", "Hossain", "Ali", "Rahman", "Choudhury",
    "Mohammad", "Shikdar", "Majumdar", "Sikdar", "Khan"
  ];
  return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
}

// Human-like typing with delay and occasional backspace
async function humanType(page, selector, text) {
  for (const ch of text) {
    await page.type(selector, ch, { delay: 150 + Math.random() * 150 });
    if (Math.random() < 0.1) { // 10% chance of backspace
      await page.keyboard.press('Backspace');
      await page.type(selector, ch, { delay: 150 + Math.random() * 150 });
    }
  }
}

// Human-like mouse movements with delay
async function humanMove(page) {
  await page.mouse.move(
    Math.random() * 700,
    Math.random() * 700,
    { steps: 15 }
  );
  await page.waitForTimeout(500 + Math.random() * 1500); // wait 0.5 to 2 seconds
}

// Get verification code from email API
async function getVerificationCode(email) {
  for (let t = 0; t < 12; t++) {
    try {
      const res = await fetch(`https://hotmail999.com/api/get_mail.php?email=${encodeURIComponent(email)}`);
      const json = await res.json();
      if (json.status && json.data && json.data.length > 0) {
        const body = json.data[0].text || json.data[0].subject || "";
        const match = body.match(/\b\d{5,6}\b/);
        if (match) return match[0];
      }
    } catch (err) {}
    await new Promise(r => setTimeout(r, 5000));
  }
  return null;
}

// Create Facebook account with given details
async function createFacebookAccount({ name, dob, email, password, proxy }) {
  const args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-blink-features=AutomationControlled'
  ];
  if (proxy) args.push(`--proxy-server=${proxy}`);

  const browser = await puppeteer.launch({
    headless: true,
    args
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(randomUseragent.getRandom());
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto('https://www.facebook.com/reg', { waitUntil: 'networkidle2', timeout: 60000 });

    await humanMove(page);
    await page.waitForSelector('input[name="firstname"]');
    await humanType(page, 'input[name="firstname"]', name.split(' ')[0]);
    await humanType(page, 'input[name="lastname"]', name.split(' ')[1]);
    await humanType(page, 'input[name="reg_email__"]', email);
    await humanType(page, 'input[name="reg_passwd__"]', password);

    await page.select('select[name="birthday_day"]', dob.day.toString());
    await page.select('select[name="birthday_month"]', dob.month.toString());
    await page.select('select[name="birthday_year"]', dob.year.toString());

    await page.click(['input[value="1"]', 'input[value="2"]'][Math.floor(Math.random() * 2)]);
    await humanMove(page);
    await page.click('button[name="websubmit"]');

    await page.waitForSelector('input[name="code"]', { timeout: 60000 });
    const code = await getVerificationCode(email);
    if (code) {
      await humanType(page, 'input[name="code"]', code);
      await page.click('button[name="confirm"]');
      await page.waitForTimeout(5000);
    }

    return { email, password, name, dob, status: code ? "Verified" : "Unverified" };
  } catch (err) {
    return null;
  } finally {
    await browser.close();
  }
}

module.exports = (bot) => {
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text || "";

    if (!text.startsWith('/fb')) return;
    const args = text.trim().split(/\s+/);
    if (args.length < 6) {
      return bot.sendMessage(chatId, "Usage: /cfb <count> - <password> - <prefix>");
    }

    const count = parseInt(args[1]);
    const password = args[3];
    const prefix = args[5];
    const proxies = getProxies();
    const results = [];

    for (let i = 0; i < count; i++) {
      const email = serialEmail(prefix, i);
      const name = randomName();
      const dob = randomDate();
      const proxy = proxies[i % proxies.length] || null;

      await bot.sendMessage(chatId, `🔄 Creating account ${i + 1}/${count} → ${email} (${proxy || 'No Proxy'})`);
      const acc = await createFacebookAccount({ name, dob, email, password, proxy });
      if (acc) {
        results.push(acc);
        await bot.sendMessage(chatId, `✅ ${acc.email} → ${acc.status}`);
      } else {
        await bot.sendMessage(chatId, `❌ Failed: ${email}`);
      }

      // র‍্যান্ডম বিরতি ৫-১০ সেকেন্ড
      await new Promise(r => setTimeout(r, 5000 + Math.random() * 5000));
    }

    if (results.length) {
      const filePath = path.join(__dirname, 'cfb_results.txt');
      const content = results.map(r => `${r.name} | ${r.email} | ${r.password} | ${r.dob.day}/${r.dob.month}/${r.dob.year} | ${r.status}`).join('\n');
      fs.writeFileSync(filePath, content);
      await bot.sendDocument(chatId, filePath);
    }
  });
};
