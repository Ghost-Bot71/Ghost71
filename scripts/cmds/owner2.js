"use strict";
const { buildCyberpunkGif } = require("../helpers/cyberpunkGif");

const OWNER = {
  name: "Ew'r Hinata",
  address: "Saidpur, Nilphamari, Bangladesh",
  age: "Secret 🔒",
  job: "Student & Developer",
  hobby: "Gaming & Travelling 🎮✈️",
  fb: "facebook.com/profile.php?id=61575436812912",
  uids: ["61592104482524", "61575436812912"]
};

module.exports = {
  config: {
    name: "owner2",
    aliases: ["ownercard", "devinfo"],
    version: "2.0", author: "Ew'r Hinata",
    countDown: 5, role: 0,
    shortDescription: "🌌 Owner Profile — Galaxy Theme",
    category: "info",
    guide: { en: "{pn}" }
  },
  onStart: async function ({ message, event }) {
    await message.reaction("⏳", event.messageID);
    const card =
      `\n🌌 ━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `✨   𝗚𝗔𝗟𝗔𝗫𝗬 𝗢𝗪𝗡𝗘𝗥 𝗖𝗔𝗥𝗗 🌠   \n` +
      `🌌 ━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `🌟 𝗡𝗮𝗺𝗲      : ${OWNER.name}\n` +
      `🪐 𝗟𝗼𝗰𝗮𝘁𝗶𝗼𝗻 : ${OWNER.address}\n` +
      `⭐ 𝗔𝗴𝗲       : ${OWNER.age}\n` +
      `💫 𝗝𝗼𝗯       : ${OWNER.job}\n` +
      `🎇 𝗛𝗼𝗯𝗯𝘆    : ${OWNER.hobby}\n` +
      `🔭 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 : ${OWNER.fb}\n\n` +
      `🆔 𝗢𝘄𝗻𝗲𝗿 𝗨𝗜𝗗𝘀 : ${OWNER.uids.join(" • ")}\n\n` +
      `🌌 ━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🎀 𝗘𝘄'𝗿 𝗛𝗶𝗻𝗮𝘁𝗮 — 𝗙𝗿𝗼𝗺 𝗕𝗗 🇧🇩`;
    const gif = await buildCyberpunkGif({ title: "EWR HINATA", subtitle: "GALAXY OWNER" });
    await message.reaction("✅", event.messageID);
    return message.reply(gif ? { body: card, attachment: gif } : card);
  }
};
