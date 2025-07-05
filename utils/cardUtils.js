const axios = require('axios');

const binDatabase = {
  "515462": {
    "bank": "Example Bank",
    "country": "United States",
    "emoji": "🇺🇸",
    "scheme": "Visa",
    "type": "Credit",
    "level": "Standard"
  }
};

function luhnCheck(num) {
  let arr = (num + '').split('').reverse().map(x => parseInt(x));
  let lastDigit = arr.shift();
  let sum = arr.reduce((acc, val, i) =>
    (i % 2 !== 0 ? acc + val : acc + ((val * 2) % 9) || 9), 0);
  return (sum + lastDigit) % 10 === 0;
}

function generateValidCard(bin) {
  let cardNumber;
  do {
    cardNumber = bin + Math.floor(Math.random() * 1e10).toString().padStart(10, '0');
    cardNumber = cardNumber.substring(0, 16);
  } while (!luhnCheck(cardNumber));

  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const year = String(new Date().getFullYear() + Math.floor(Math.random() * 5)).slice(-2);
  const cvv = String(Math.floor(100 + Math.random() * 900));

  return `${cardNumber}|${month}|20${year}|${cvv}`;
}

function createCCMessage(bin, binInfo, cards) {
  return {
    text:
      `💳 *Generated Credit Cards for BIN:* \`${bin}\`\n\n` +
      `📋 *Tap any card below to copy:*\n\n` +
      cards.map(card => `\`${card}\``).join('\n') +
      `\n\n🏦 *Bank:* ${binInfo.bank}\n` +
      `🌎 *Country:* ${binInfo.country} ${binInfo.emoji}\n` +
      `🔖 *Card Scheme:* ${binInfo.scheme}\n` +
      `🔖 *Card Type:* ${binInfo.type}\n` +
      `💳 *Card Level:* ${binInfo.level}`,
    options: { parse_mode: 'Markdown' }
  };
}

async function getBinInfo(bin) {
  if (binDatabase[bin]) return binDatabase[bin];

  try {
    const response = await axios.get(`https://lookup.binlist.net/${bin}`);
    return {
      bank: response.data.bank?.name || "UNKNOWN BANK",
      country: response.data.country?.name || "UNKNOWN",
      emoji: response.data.country?.emoji || "",
      scheme: response.data.scheme?.toUpperCase() || "UNKNOWN",
      type: response.data.type?.toUpperCase() || "UNKNOWN",
      level: "N/A"
    };
  } catch {
    return {
      bank: "UNKNOWN BANK",
      country: "UNKNOWN",
      emoji: "",
      scheme: "UNKNOWN",
      type: "UNKNOWN",
      level: "N/A"
    };
  }
}

module.exports = {
  luhnCheck,
  generateValidCard,
  createCCMessage,
  getBinInfo
};
