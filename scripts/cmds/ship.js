const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const GHOST = fs.readJsonSync(path.join(__dirname, "../../ghostConfig.json"));

const SHIP_EMOJIS = ["💘","❤️","💕","💞","💓","💗","💖","🥰","😍","💑","👫","💏"];
const SHIP_MSGS = [
  "এরা একে অপরের জন্য তৈরি! 💕",
  "Perfect match! 🥰 আল্লাহ মিলিয়ে দিক!",
  "এদের ভালোবাসা অনেক গভীর! ❤️",
  "Ship করা হলো! 🚢💖",
  "Aww! এরা super cute couple! 😍",
  "এই match টা too good! 💞",
  "Love is in the air! 💕✨",
  "Congratulations! তোমরা perfect! 🎉❤️"
];

module.exports = {
  config: {
    name: "ship",
    aliases: ["love", "lovemeter", "couple"],
    version: "1.0",
    author: "Rakib Islam",
    countDown: 5,
    role: 0,
    shortDescription: "দুইজনের love % বের করো",
    longDescription: "দুইজন মানুষের মধ্যে love compatibility % দেখাও",
    category: "fun",
    guide: "{pn} @user1 @user2 অথবা reply করে @user",
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    const { mentions, senderID, messageReply } = event;
    const mentionIDs = Object.keys(mentions || {});
    let user1ID, user2ID;

    if (mentionIDs.length >= 2) {
      [user1ID, user2ID] = mentionIDs;
    } else if (mentionIDs.length === 1) {
      user1ID = senderID;
      user2ID = mentionIDs[0];
    } else if (messageReply?.senderID) {
      user1ID = senderID;
      user2ID = messageReply.senderID;
    } else {
      return message.reply(
        `💘 Ship করতে হলে:\n\n` +
        `.ship @user1 @user2\n` +
        `অথবা কারো message এ reply দিয়ে .ship\n\n` +
        `👻 Ghost Bot — ${GHOST.ownerName}`
      );
    }

    if (user1ID === user2ID) {
      return message.reply("😂 নিজেকে নিজে ship করা যাবে না!");
    }

    const percent = Math.floor(
      ((parseInt(user1ID.slice(-4)) + parseInt(user2ID.slice(-4))) % 100 + 1)
    );

    const filled = Math.floor(percent / 10);
    const bar = "❤️".repeat(filled) + "🖤".repeat(10 - filled);

    let name1, name2;
    try {
      name1 = await usersData.getName(user1ID) || "User 1";
      name2 = await usersData.getName(user2ID) || "User 2";
    } catch {
      name1 = "User 1";
      name2 = "User 2";
    }

    const emoji = SHIP_EMOJIS[Math.floor(Math.random() * SHIP_EMOJIS.length)];
    const msg = SHIP_MSGS[Math.floor(Math.random() * SHIP_MSGS.length)];

    const shipName = name1.split(" ")[0].slice(0, 3) + name2.split(" ")[0].slice(0, 3);

    return message.reply(
      `${emoji} 𝗦𝗵𝗶𝗽 𝗠𝗲𝘁𝗲𝗿\n` +
      `━━━━━━━━━━━━━━━━━\n\n` +
      `👤 ${name1}\n` +
      `💕 +\n` +
      `👤 ${name2}\n\n` +
      `🚢 Ship Name: ${shipName}\n\n` +
      `${bar}\n` +
      `💯 Love: ${percent}%\n\n` +
      `💬 ${msg}\n\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      `👻 Ghost Bot — ${GHOST.ownerName}`
    );
  }
};
