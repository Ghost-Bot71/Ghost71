module.exports.config = {
  name: "owner3",
  aliases: ["admin3", "admininfo3"],
  version: "2.5",
  role: 0,
  author: "NXZ",
  description: "Get owner info with image or video (Imgur Supported)",
  category: "system",
  usages: "owner",
  cooldowns: 5
};

module.exports.onStart = async function({ api, event }) {
  const axios = require("axios");
  const fs = require("fs-extra");
  
  const infoText = "===[ 𝗢𝗪𝗡𝗘𝗥 𝗗𝗘𝗧𝗔𝗜𝗟𝗦 ]===\n\n" +
                   "👤 𝗡𝗮𝗺𝗲      : SIYAM\n" +
                   "🎂 𝗔𝗴𝗲       : Secret\n" +
                   "🕉️ 𝗥𝗲𝗹𝗶𝗴𝗶𝗼𝗻  : Islam\n" +
                   "💍 𝗥𝗲𝗹𝗮𝘁𝗶𝗼𝗻  : Single\n" +
                   "📍 𝗔𝗱𝗱𝗿𝗲𝘀𝘀  : Dhaka,Keraniganj,BD\n\n" +
                   "━━━━━ 𝗖𝗢𝗡𝗧𝗔𝗖𝗧 ━━━━━\n\n" +
                   "🔵 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸  : Si Y AM\n" +
                   "🔗 𝗟𝗶𝗻𝗸      : Facebook.com/100073663986617\n" +
                   "💬 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽  : +966576296390\n" +
                   "⚜️ 𝗜𝗻𝘀𝘁𝗮𝗚𝗿𝗮𝗺  : pain_820258\n\n" +
                   "━━━━━━━━━━━━━━━━━━━━\n" +
                   "✨ 𝗧𝗵𝗮𝗻𝗸𝘀 𝗳𝗼𝗿 𝘂𝘀𝗶𝗻𝗴 𝗯𝗼𝘁 ✨";

  const mediaURL = "https://i.imgur.com/GV3lauZ.mp4"; 
  const ext = mediaURL.split('.').pop().split('?')[0] || "mp4";
  const path = __dirname + `/cache/owner_media.${ext}`;

  try {
    const res = await axios.get(mediaURL, { 
      responseType: "arraybuffer",
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
      }
    });
    
    fs.writeFileSync(path, Buffer.from(res.data, "utf-8"));

    return api.sendMessage({
      body: infoText,
      attachment: fs.createReadStream(path)
    }, event.threadID, () => {
      if (fs.existsSync(path)) fs.unlinkSync(path);
    }, event.messageID);

  } catch (err) {
    return api.sendMessage(infoText, event.threadID, event.messageID);
  }
};
