const axios = require('axios');

module.exports = {
  config: {
    name: "freefirename",
    aliases: ["ffname", "ffnick", "fancytext"],
    version: "1.0.0",
    author: "ACS RAKIB",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Generate stylish Free Fire nicknames",
      bn: "ফ্রি ফায়ার স্টাইলিশ নিকনেম তৈরি করুন"
    },
    longDescription: {
      en: "Convert your normal name into multiple aesthetic and stylish cyberpunk fonts for Free Fire.",
      bn: "আপনার সাধারণ নামটিকে ফ্রি ফায়ারের জন্য বিভিন্ন আকর্ষণীয় ফন্ট ও সিম্বলে রূপান্তর করুন।"
    },
    category: "FUN",
    guide: {
      en: "{pn} [your_name]\nExample: {pn} Rakib",
      bn: "{pn} [আপনার_নাম]\nউদাহরণ: {pn} Rakib"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      // Input text input nibar standard Goat-Bot structure follow kora hoyeche
      const nameInput = args.join(" ");
      if (!nameInput) {
        return message.reply("⚠️ Doya kore apnar nam-ti likhun! (Example: !freefirename Rakib)");
      }

      // Initial response text pathano
      const loadingMessage = await message.reply("⚡ Cyberpunk API Hub theke apnar stylish nickname generate kora hocche... Doya kore apeksha korun।");

      // Apnar active dashboard er perfect API endpoint URL matching
      const apiUrl = `https://cyberpunk-api-hub--explainrhk.replit.app/api/freefirename?name=${encodeURIComponent(nameInput)}`;

      // API call request handle
      const response = await axios.get(apiUrl);
      const data = response.data;

      let resultNames = [];

      // Multiple response data structure handle korar conditional checking
      if (Array.isArray(data)) {
        resultNames = data;
      } else if (data.result && Array.isArray(data.result)) {
        resultNames = data.result;
      } else if (data.names && Array.isArray(data.names)) {
        resultNames = data.names;
      } else if (typeof data === 'object') {
        resultNames = Object.values(data).filter(val => typeof val === 'string');
      } else {
        resultNames = [data.toString()];
      }

      if (resultNames.length === 0 || !resultNames[0]) {
        if (loadingMessage && loadingMessage.messageID) {
          api.unsendMessage(loadingMessage.messageID);
        }
        return message.reply("❌ API theke kono stylish nam paona jayni। Porer bar onno nam diye try korun।");
      }

      // Output string custom design block build-up
      let messageBody = `━━☠️ 𝗙𝗥𝗘𝗘 𝗙𝗜𝗥𝗘 𝗡𝗔𝗠𝗘𝗦 ☠️━━\n\n`;
      messageBody += `👤 Original Name: ${nameInput}\n`;
      messageBody += `✨ Generated Styles:\n`;
      messageBody += `────────────────────\n`;

      resultNames.slice(0, 15).forEach((styledName, index) => {
        messageBody += `${index + 1}.  ${styledName}\n`;
      });

      messageBody += `────────────────────\n`;
      messageBody += `➥ Powered by: ACS RAKIB's API Hub`;

      // Loading message delete kore final stylish response return kora
      if (loadingMessage && loadingMessage.messageID) {
        api.unsendMessage(loadingMessage.messageID);
      }
      
      return message.reply(messageBody);

    } catch (error) {
      console.error("Free Fire Name API Error:", error);
      return message.reply("❌ API Server-e somossa ba response pawa jayni! Doya kore check korun apnar Replit project active ache কিনা।");
    }
  }
};
      
