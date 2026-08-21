/**
 * @MODULE: CUSTOM_TAG_MASK
 * @AUTHOR: RAKIB ISLAM (ACS)
 * @VERSION: 3.0.0
 * @DESCRIPTION: Reply to a message and create a custom tag or mention masked text.
 */

module.exports = {
  config: {
    name: "a",
    aliases: ["mask", "customtag", "tc"],
    version: "3.0.0",
    author: "RAKIB ISLAM",
    countDown: 2,
    role: 0,
    category: "box",
    shortDescription: { en: "Tag users with custom text/mask" },
    guide: { en: "Reply to a message and type text, or use command: {pn} [text]" }
  },

  // ১. গ্লোবাল লিসেনার লজিক (কারো মেসেজে সরাসরি ডট বা টেক্সট দিয়ে রিপ্লাই দিলে কাজ করবে)
  onChat: async function ({ api, event, message }) {
    const { type, messageReply, body, threadID, messageID, senderID } = event;
    
    if (senderID == api.getCurrentUserID() || !body) return;

    // যদি মেসেজটি কোনো মেসেজের 'Reply' হয় এবং সেটা সাধারণ টেক্সট হয়
    if (type == "message_reply" && !body.startsWith(global.config.PREFIX)) {
      const targetUID = messageReply.senderID;
      const mentionText = body;

      const mentions = [{
        tag: mentionText,
        id: targetUID
      }];

      return api.sendMessage({
        body: mentionText,
        mentions: mentions
      }, threadID, messageID);
    }
  },

  // ২. প্রিফিক্স কমান্ড লজিক (যেমন: .a [text] দিয়ে রিপ্লাই দিলে কাজ করবে)
  onStart: async function ({ api, event, args, message }) {
    const { type, messageReply, threadID, messageID } = event;

    if (type !== "message_reply") {
      return message.reply("❌ ভাই, কাউকে ট্যাগ করতে তার মেসেজে রিপ্লাই দিয়ে কমান্ডটি লিখুন।");
    }

    const mentionText = args.join(" ");
    if (!mentionText) {
      return message.reply("❌ কাস্টম ট্যাগের নাম বা টেক্সটটি লিখুন। যেমন: .a আমার বস");
    }

    const targetUID = messageReply.senderID;
    const mentions = [{
      tag: mentionText,
      id: targetUID
    }];

    return api.sendMessage({
      body: mentionText,
      mentions: mentions
    }, threadID, messageID);
  }
};