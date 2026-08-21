const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json"
  );
  return base.data.mahmud;
};

/**
* @author MahMUD
* @author: do not delete it
*/

module.exports = {
  config: {
    name: "rip",
    aliases: [],
    version: "1.7",
    author: "Rakib Islam",
    role: 0,
    category: "fun",
    cooldown: 10,
    guide: "rip [mention-reply-UID]",
  },

  onStart: async function ({ api, event, args }) {

    const { threadID, messageID, messageReply, mentions } = event;
    let id2; if (messageReply) { id2 = messageReply.senderID; } else if (Object.keys(mentions).length > 0) {
    id2 = Object.keys(mentions)[0];  } else if (args[0]) {  id2 = args[0]; } else {
    return api.sendMessage( "baby, Mention, reply, or provide UID of the target.", threadID, messageID );
  }

   try {
    const url = `${await baseApiUrl()}/api/dig?type=rip&user=${id2}`;
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const filePath = path.join(__dirname, `rip_${id2}.png`);
    fs.writeFileSync(filePath, response.data);

     
    api.sendMessage({ attachment: fs.createReadStream(filePath),
    body: ` rip  🐸`,
     },
    threadID, () => fs.unlinkSync(filePath),  messageID );
  } catch (err) {
    console.error(err);
    api.sendMessage(`🥹error, contact MahMUD.`, threadID, messageID);
    }
  },
};
