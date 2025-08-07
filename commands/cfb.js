const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const randomUseragent = require("random-useragent");

puppeteer.use(StealthPlugin());

function randomString(length = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let res = "";
  for (let i = 0; i < length; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomName() {
  const firstNames = ["John", "Alex", "Michael", "Chris", "David", "James", "Robert", "Daniel"];
  const lastNames = ["Smith", "Johnson", "Brown", "Williams", "Jones", "Miller", "Davis"];
  return firstNames[randomInt(0, firstNames.length - 1)] + " " + lastNames[randomInt(0, lastNames.length - 1)];
}

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function moveMouseRandom(page) {
  const width = 800;
  const height = 600;
  for (let i = 0; i < 20; i++) {
    await page.mouse.move(Math.random() * width, Math.random() * height, { steps: 10 });
    await delay(100 + Math.random() * 200);
  }
}

async function createFacebookAccount(prefix, password) {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.setUserAgent(randomUseragent.getRandom());
  await page.setViewport({ width: 1200, height: 800 });

  try {
    await page.goto("https://www.facebook.com/reg", {
      waitUntil: "networkidle2",
      timeout: 60000
    });

    await delay(3000);
    await moveMouseRandom(page);

    const fullName = randomName();
    const email = prefix.toLowerCase() + randomString(5) + "@gmail.com";
    const nameParts = fullName.split(" ");

    await page.type('input[name="firstname"]', nameParts[0], { delay: 100 });
    await delay(500);
    await page.type('input[name="lastname"]', nameParts[1], { delay: 100 });
    await delay(500);
    await page.type('input[name="reg_email__"]', email, { delay: 100 });
    await delay(500);
    await page.type('input[name="reg_passwd__"]', password, { delay: 100 });
    await delay(500);
    await page.select('select[name="birthday_day"]', String(randomInt(1, 28)));
    await page.select('select[name="birthday_month"]', String(randomInt(1, 12)));
    await page.select('select[name="birthday_year"]', String(randomInt(1987, 2002)));
    await delay(500);

    const genderVal = Math.random() < 0.5 ? "1" : "2";
    await page.click(`input[value="${genderVal}"]`);
    await delay(1000);

    await page.click('button[name="websubmit"]');
    await delay(8000); // Wait for page load

    await browser.close();

    return { email, password, fullName };
  } catch (e) {
    await browser.close();
    throw e;
  }
}

module.exports = {
  config: {
    name: "cfb",
    description: "Create Facebook accounts with prefix and password",
    usage: "cfb <number> - <password>",
    cooldown: 10,
    permissions: [0, 1, 2],
    credits: "RIN"
  },

  onCall: async function ({ message, args }) {
    if (args.length < 3) {
      return message.reply(
        "ব্যবহার: cfb <number> - <password>\nউদাহরণ: cfb 10 - Likhon10"
      );
    }

    const numberCount = parseInt(args[0]);
    if (isNaN(numberCount) || numberCount <= 0) {
      return message.reply("দয়া করে সঠিক সংখ্যা দিন।");
    }

    if (args[1] !== "-") {
      return message.reply("সঠিক ফরম্যাট ব্যবহার করুন: cfb <number> - <password>");
    }

    const password = args.slice(2).join(" ");
    if (!password) {
      return message.reply("পাসওয়ার্ড দিন।");
    }

    for (let i = 0; i < numberCount; i++) {
      try {
        await message.reply(`⌛️ অ্যাকাউন্ট তৈরি হচ্ছে ${i + 1}...`);
        const result = await createFacebookAccount("likhon10", password);
        await message.reply(
          `✅ অ্যাকাউন্ট তৈরি হয়েছে!\n\n` +
            `👤 নাম: ${result.fullName}\n` +
            `📧 ইমেইল: ${result.email}\n` +
            `🔑 পাসওয়ার্ড: ${result.password}\n\n` +
            `*মনে রাখবেন:* কনফার্মেশন কোড বসানোর আগেই থেমে গেছে।`
        );
      } catch (e) {
        await message.reply(`❌ অ্যাকাউন্ট তৈরি করতে সমস্যা: ${e.message}`);
      }
    }
  }
};
