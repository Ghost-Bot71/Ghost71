"use strict";
// send.js — Admin Media Forwarder & Broadcast
// Fixed: getStreamsFromAttachment moved inside function (not module-level)

const allowedMedia = ["photo","png","animated_image","video","audio"];

module.exports = {
  config: {
    name: "send",
    aliases: ["forward","fwd","broadcast"],
    version: "2.1", author: "Rakib Islam",
    countDown: 5, role: 2,
    shortDescription: "📨 Forward media to specific/all groups",
    category: "admin",
    guide: { en: "Reply to media: {pn}  |  Broadcast: {pn} all" }
  },

  onStart: async function ({ api, event, args, message }) {
    const { adminBot } = global.GoatBot?.config || global.config || {};
    const { senderID, threadID, messageReply } = event;

    if (!adminBot?.includes(senderID)) {
      return message.reply("❌ শুধুমাত্র Bot Admin এই command ব্যবহার করতে পারবে!");
    }

    if (!messageReply?.attachments?.length) {
      return message.reply("❌ কোনো ভিডিও/অডিও/ছবির উপর reply দিয়ে .send লিখো!");
    }

    const validAtt = messageReply.attachments.filter(a => allowedMedia.includes(a.type));
    if (!validAtt.length) {
      return message.reply("❌ এই file format সাপোর্ট করে না। Video/Audio/Photo তে reply করো।");
    }

    const getStreams = global.utils?.getStreamsFromAttachment;
    if (!getStreams) {
      return message.reply("❌ Stream utility পাওয়া যায়নি। Bot restart করো।");
    }

    try {
      const list = await api.getThreadList(30, null, ["INBOX"]);
      const groups = list.filter(g => g.isGroup === true || g.isSubscribed === true);

      if (!groups.length) return message.reply("❌ কোনো active group পাওয়া যায়নি।");

      // Broadcast to ALL
      if (args[0]?.toLowerCase() === "all") {
        await message.reply(`📢 সব ${groups.length} টি group এ পাঠানো হচ্ছে...`);
        const streams = await getStreams(validAtt);
        let ok = 0;
        for (const g of groups) {
          try {
            await api.sendMessage({
              body: "📢 𝗔𝗗𝗠𝗜𝗡 𝗕𝗥𝗢𝗔𝗗𝗖𝗔𝗦𝗧",
              attachment: streams
            }, g.threadID);
            ok++;
          } catch {}
        }
        return message.reply(`✅ ${ok}/${groups.length} group এ পাঠানো হয়েছে।`);
      }

      // Show group list
      const listLines = [];
      let i = 1;
      for (const g of groups) {
        let name = g.threadName;
        if (!name?.trim() || name === "null") {
          try { name = (await api.getThreadInfo(g.threadID)).threadName; } catch {}
          name = name || `Group (${g.threadID})`;
        }
        listLines.push(`${i}. ${name}\n   TID: ${g.threadID}`);
        i++;
      }

      const sent = await api.sendMessage(
        `📨 𝗦𝗘𝗡𝗗 𝗠𝗘𝗗𝗜𝗔 — 𝗚𝗿𝗼𝘂𝗽 𝗟𝗶𝘀𝘁\n━━━━━━━━━━━━━━━━━\n${listLines.join("\n")}\n━━━━━━━━━━━━━━━━━\n👉 নম্বর দিয়ে reply করো`,
        threadID
      );

      global.GoatBot.onReply.set(sent.messageID, {
        commandName: "send",
        messageID: sent.messageID,
        author: senderID,
        validAtt,
        groups
      });
    } catch (e) {
      return message.reply("❌ Error: " + (e.message || "Unknown"));
    }
  },

  onReply: async function ({ api, event, Reply, args, message }) {
    const { author, groups, validAtt } = Reply;
    if (event.senderID !== author) return;

    const idx = parseInt(args[0], 10);
    if (isNaN(idx) || idx < 1 || idx > groups.length) {
      return message.reply("❌ ভুল নম্বর! লিস্টের নম্বর দিয়ে reply করো।");
    }

    const getStreams = global.utils?.getStreamsFromAttachment;
    if (!getStreams) return message.reply("❌ Stream utility পাওয়া যায়নি।");

    const grp = groups[idx-1];
    let name = grp.threadName;
    try { name = (await api.getThreadInfo(grp.threadID)).threadName || name; } catch {}

    try {
      await message.reply(`⏳ "${name}" এ পাঠানো হচ্ছে...`);
      const streams = await getStreams(validAtt);
      await api.sendMessage({ body: "📨 𝗙𝗢𝗥𝗪𝗔𝗥𝗗𝗘𝗗 𝗕𝗬 𝗔𝗗𝗠𝗜𝗡", attachment: streams }, grp.threadID);
      message.reply(`✅ "${name}" এ পাঠানো হয়েছে!`);
    } catch (e) {
      message.reply("❌ পাঠানো যায়নি: " + (e.message || "Unknown"));
    } finally {
      global.GoatBot.onReply.delete(event.messageID);
    }
  }
};
