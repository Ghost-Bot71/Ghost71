const axios = require("axios");

module.exports = {
  config: {
    name: "coupledp",
    aliases: ["cdp"],
    version: "3.7",
    author: "xalman",
    description: "Random Matching Couple DP",
    category: "FUN & SOCIAL",
    cooldown: 5
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID } = event;
    const API_URL = "https://xalman-apis.vercel.app/api/cdp";

    try {
      api.setMessageReaction("⏳", messageID, () => {}, true);

      const res = await axios.get(API_URL);
      const pair = res.data.pair;

      if (!pair || !pair.boy || !pair.girl) throw new Error("Invalid Data");

      const getStream = async (url) => {
        const response = await axios.get(url, { 
          responseType: "stream",
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
            "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            "Referer": "https://imgur.com/"
          }
        });
        return response.data;
      };

      const boyStream = await getStream(pair.boy);
      const girlStream = await getStream(pair.girl);

      api.sendMessage({
        body: "❖ 𝐌𝐀𝐓𝐂𝐇𝐈𝐍𝐆 𝐂𝐎𝐔𝐏𝐋𝐄 𝐃𝐏 ❖\n━━━━━━━━━━━━━━━━━━\n",
        attachment: [boyStream, girlStream]
      }, threadID, () => {
        api.setMessageReaction("✅", messageID, () => {}, true);
      }, messageID);

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("✕ Failed to load images!", threadID, messageID);
    }
  }
};
