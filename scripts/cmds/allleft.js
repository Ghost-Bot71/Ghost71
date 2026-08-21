"use strict";
// allleft.js — Leave Group Command (Admin only)
// Fixed: global.GoatBot.config, proper admin check

module.exports = {
  config: {
    name: "allleft",
    aliases: ["leavegc","outgc"],
    version: "1.8", author: "Rakib Islam",
    countDown: 5, role: 2,
    shortDescription: "📋 List groups & leave any via reply",
    category: "admin",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event, message }) {
    const adminBot = global.GoatBot?.config?.adminBot || global.config?.adminBot || [];
    const { senderID, threadID } = event;

    if (!adminBot.includes(senderID)) {
      return message.reply("❌ এই command শুধুমাত্র Bot Admin এর জন্য!");
    }

    try {
      const list = await api.getThreadList(25, null, ["INBOX"]);
      const groups = list.filter(g => g.isGroup === true || g.isSubscribed === true);

      if (!groups.length) {
        return message.reply("❌ Bot এ কোনো active group নেই।");
      }

      await message.reply("⏳ Group list লোড হচ্ছে...");

      const lines = [];
      let i = 1;
      for (const g of groups) {
        let name = g.threadName;
        if (!name?.trim() || name === "null" || name === "undefined") {
          try { name = (await api.getThreadInfo(g.threadID)).threadName; } catch {}
          name = name || `Group (${g.threadID})`;
        }
        const members = g.participantIDs?.length || "?";
        lines.push(`${i}. 👥 ${name}\n   TID: ${g.threadID} | Members: ${members}`);
        i++;
      }

      const sent = await api.sendMessage(
        `📋 𝗕𝗢𝗧 𝗚𝗥𝗢𝗨𝗣 𝗟𝗜𝗦𝗧\n━━━━━━━━━━━━━━━━━━━━\n${lines.join("\n")}\n━━━━━━━━━━━━━━━━━━━━\n👉 নম্বর দিয়ে reply করলে সেই group থেকে leave নেবে।`,
        threadID
      );

      global.GoatBot.onReply.set(sent.messageID, {
        commandName: "allleft",
        messageID: sent.messageID,
        author: senderID,
        groups
      });
    } catch (e) {
      message.reply("❌ Group list লোড করতে সমস্যা: " + (e.message || "Unknown"));
    }
  },

  onReply: async function ({ api, event, Reply, args, message }) {
    const { author, groups } = Reply;
    if (event.senderID !== author) return;

    const idx = parseInt(args[0], 10);
    if (isNaN(idx) || idx < 1 || idx > groups.length) {
      return message.reply("❌ ভুল নম্বর! লিস্টে থাকা নম্বর দিয়ে reply করো।");
    }

    const grp = groups[idx-1];
    const gid = grp.threadID;
    let name = grp.threadName;
    try { name = (await api.getThreadInfo(gid)).threadName || name; } catch {}
    name = name || `Group (${gid})`;

    try {
      await api.sendMessage(
        `⚠️ 𝗕𝗢𝗧 𝗟𝗘𝗔𝗩𝗜𝗡𝗚\n━━━━━━━━━━━━━━━━━\nAdmin এর নির্দেশে এই group থেকে bot চলে যাচ্ছে।\nএতদিন সাথে থাকার জন্য ধন্যবাদ! 💙\n━━━━━━━━━━━━━━━━━\n🤖 Rakib Islam`,
        gid
      );
      await new Promise(r => setTimeout(r, 1500));
      await api.removeUserFromGroup(api.getCurrentUserID(), gid);
      message.reply(`✅ "${name}" থেকে leave নেওয়া হয়েছে!`);
    } catch (e) {
      message.reply("❌ Leave নিতে সমস্যা: " + (e.message||"Unknown"));
    } finally {
      global.GoatBot.onReply.delete(event.messageID);
    }
  }
};
