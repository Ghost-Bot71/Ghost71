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
    name: "owner3",
    aliases: ["matrix", "devcard"],
    version: "2.0", author: "Ew'r Hinata",
    countDown: 5, role: 0,
    shortDescription: "💚 Owner Profile — Matrix Terminal",
    category: "info",
    guide: { en: "{pn}" }
  },
  onStart: async function ({ message, event }) {
    await message.reaction("⏳", event.messageID);
    const ts = new Date().toISOString().replace("T", " ").slice(0, 19);
    const card =
      `\n💚 ┌────────────────────────────┐\n` +
      `💚 │  > MATRIX_SYS v3.0 BOOT    │\n` +
      `💚 │  > AGENT_FILE DECRYPTED ✓  │\n` +
      `💚 └────────────────────────────┘\n\n` +
      `$ cat /etc/agent.conf\n` +
      `  NAME     = "${OWNER.name}"\n` +
      `  LOCATION = "${OWNER.address}"\n` +
      `  AGE      = "${OWNER.age}"\n` +
      `  STATUS   = "${OWNER.job}"\n` +
      `  HOBBY    = "${OWNER.hobby}"\n` +
      `  LINK     = "${OWNER.fb}"\n\n` +
      `  OWNER_UIDS = "${OWNER.uids.join(" • ")}"\n\n` +
      `$ uptime: ${ts} UTC\n` +
      `> SYSTEM_OK — AGENT AUTHENTICATED ✓\n` +
      `🎀 ████████████████████ 100%`;
    const gif = await buildCyberpunkGif({ title: "EWR HINATA", subtitle: "MATRIX OWNER" });
    await message.reaction("✅", event.messageID);
    return message.reply(gif ? { body: card, attachment: gif } : card);
  }
};
