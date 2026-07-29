const axios = require('axios');

module.exports = {
  config: {
    name: "alldl",
    version: "12.0",
    author: "xalman",
    countDown: 3,
    role: 0,
    shortDescription: "Ultra Fast Multi-Source Downloader",
    longDescription: "Download videos using Xalman API with flexible data parsing.",
    category: "ANIME & MEDIA",
    guide: "{pn} <link> or just send the link"
  },

  onStart: async function ({ api, event, args, message }) {
    const url = args[0];
    if (!url) return message.reply("⚠️ Please provide a video link!");
    return await this.handleDownload(url, api, event, message);
  },

  onChat: async function ({ api, event, message }) {
    const { body, senderID } = event;
    if (!body || senderID === api.getCurrentUserID()) return;

    const linkRegEx = /(https?:\/\/[^\s]+)/g;
    const match = body.match(linkRegEx);

    if (match) {
      const url = match[0];
      const sites = ["tiktok.com", "facebook.com", "fb.watch", "instagram.com", "reels", "youtube.com", "youtu.be", "pinterest.com", "pin.it", "twitter.com", "x.com", "capcut.com"];
      
      if (sites.some(s => url.includes(s))) {
        return await this.handleDownload(url, api, event, message);
      }
    }
  },

  handleDownload: async function (url, api, event, message) {
    const { messageID } = event;
    const start = Date.now();

    try {
      if (api.setMessageReaction) api.setMessageReaction("⌛", messageID, () => {}, true);

      const res = await axios.get(`https://xalman-apis.vercel.app/api/alldl?url=${encodeURIComponent(url)}`);
      const resData = res.data;

      // Smart Parsing: Looks for URL and Title in multiple possible locations
      const resultObj = resData.result || {};
      const nestedData = resultObj.data || {};

      // Priority list for video URL and Title
      const videoUrl = resultObj.url || resultObj.video_url || nestedData.url || nestedData.video_url || nestedData.hd;
      const title = resultObj.title || nestedData.title || resultObj.description || "No Title";
      const platform = resData.detected_platform || "Social Media";

      if (!videoUrl) throw new Error("Could not find a valid video URL.");
      
      const stream = await axios.get(videoUrl, { 
        responseType: 'stream',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const time = ((Date.now() - start) / 1000).toFixed(2);
      const xalmanBody = 
        `『 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥 』\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `📝 𝗧𝗶𝘁𝗹𝗲: ${title.slice(0, 60)}${title.length > 60 ? "..." : ""}\n` +
        `🌐 𝗣𝗹𝗮𝘁𝗳𝗼𝗿𝗺: ${platform.toUpperCase()}\n` +
        `⏱️ 𝗧𝗶𝗺𝗲: ${time}s\n` +
        `👨‍💻 Dev: xalman\n` +
        `━━━━━━━━━━━━━━━━━━`;

      await message.reply({
        body: xalmanBody,
        attachment: stream.data
      });

      if (api.setMessageReaction) api.setMessageReaction("✅", messageID, () => {}, true);

    } catch (e) {
      console.error("Download Error:", e.message);
      if (api.setMessageReaction) api.setMessageReaction("❌", messageID, () => {}, true);
    }
  }
};
