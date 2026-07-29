module.exports.config = {
  name: "owner2",
  aliases: ["admin2", "admininfo2"],
  version: "2.5",
  role: 0,
  author: "xalman",
  description: "Get owner info with image or video (Imgur Supported)",
  category: "system",
  usages: "owner",
  cooldowns: 5
};

module.exports.onStart = async function({ api, event }) {
  const axios = require("axios");
  const fs = require("fs-extra");
  
  const infoText = "===[ 𝗢𝗪𝗡𝗘𝗥 𝗗𝗘𝗧𝗔𝗜𝗟𝗦 ]===\n\n" +
                   "👤 𝗡𝗮𝗺𝗲      : Antu\n" +
                   "🎂 𝗔𝗴𝗲       : 18\n" +
                   "🕉️ 𝗥𝗲𝗹𝗶𝗴𝗶𝗼𝗻  : Hindu\n" +
                   "💍 𝗥𝗲𝗹𝗮𝘁𝗶𝗼𝗻  : Mingle\n" +
                   "📍 𝗔𝗱𝗱𝗿𝗲𝘀𝘀  : Khagrachhari, BD\n\n" +
                   "━━━━━ 𝗖𝗢𝗡𝗧𝗔𝗖𝗧 ━━━━━\n\n" +
                   "🔵 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸  : Maybe XZ\n" +
                   "🔗 𝗟𝗶𝗻𝗸      : https://www.facebook.com/Srabus.senpai\n" +
                   "💬 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽  : 01879385410\n" +
                   "✈️ 𝗧𝗲𝗹𝗲𝗴𝗿𝗮𝗺  : @xzantu999\n\n" +
                   "━━━━━━━━━━━━━━━━━━━━\n" +
                   "✨ 𝗧𝗵𝗮𝗻𝗸𝘀 𝗳𝗼𝗿 𝘂𝘀𝗶𝗻𝗴 𝗯𝗼𝘁 ✨";

  const mediaURL = "https://i.imgur.com/9ooX4o2.mp4"; 
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
