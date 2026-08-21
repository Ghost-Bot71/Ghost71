/**
 * @fileoverview Goat Bot Custom Command - ACS Cyber Overlay
 * @author ACS RAKIB / Rakib Islam
 * Description: Overlays the custom PNG cyber frame with accurate dynamic zoom logic.
 */

const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// আপনার দেওয়া নিখুঁত প্রফেশনাল PNG ফ্রেমের ডিরেক্ট লিংক
const FRAME_URL = "https://i.ibb.co.com/bSkQBJn/20260517-213520.png";

module.exports = {
  config: {
    name: "acs",
    aliases: ["acs-mahi", "acs-rakib", "cyber", "overlay"],
    version: "3.5",
    author: "RAKIB",
    countDown: 5,
    role: 0,
    description: "ইউজারের ছবির ওপর সাইবার ফ্রেম এবং লোগো বসানোর কমান্ড (Advanced Fixed)",
    category: "image",
    guide: "{pn} [ছবিতে রিপ্লাই করুন] \nবিকল্প অপশন:\n{pn} zoom20%\n{pn} 30%\n{pn} off"
  },

  onStart: async function ({ message, event, args }) {
    try {
      // --- শক্তিশালী মাল্টি-লেয়ার ইমেজ ডিটেকশন সিস্টেম (Error Fixed) ---
      let userImageUrl = null;

      if (event.type === "message_reply" && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
        // প্রথম লেয়ারে ফটো খোঁজা
        const photo = event.messageReply.attachments.find(att => att.type === "photo");
        if (photo) userImageUrl = photo.url;
      }

      // যদি কোন কারণে মেসেঞ্জার বা এফসিএ অবজেক্ট শিফট করে (সেফটি ফলব্যাক)
      if (!userImageUrl && event.messageReply && event.messageReply.attachments) {
        if (event.messageReply.attachments[0] && event.messageReply.attachments[0].url) {
          userImageUrl = event.messageReply.attachments[0].url;
        }
      }

      // ইমেজ ইউআরএল না পাওয়া গেলে এরর মেসেজ
      if (!userImageUrl) {
        return message.reply("⚠️ Are boss ekta image e to reply dao 😉");
      }

      await message.reply("⏳ Processing... iam creating your image in sleeping mode 🐸");

      // --- জুম সেটিংস হ্যান্ডলিং লজিক ---
      let zoomPercent = 15; // ডিফল্ট অটো জুম ১৫%
      let disableZoom = false;

      if (args.length > 0) {
        const argInput = args[0].toLowerCase();
        if (argInput.includes("off") || argInput.includes("zoomoff")) {
          disableZoom = true;
        } else {
          const match = argInput.match(/\d+/);
          if (match) {
            zoomPercent = parseInt(match[0], 10);
            if (zoomPercent < 0) zoomPercent = 0;
            if (zoomPercent > 80) zoomPercent = 80; // ক্রপ লিমিট বাউন্ডারি
          }
        }
      }

      // --- ডিরেক্টরি এবং ইমেজ লোডিং ---
      const dir = path.join(__dirname, "cache");
      await fs.ensureDir(dir);

      const [mainImage, frameImage] = await Promise.all([
        loadImage(userImageUrl),
        loadImage(FRAME_URL)
      ]);

      // --- ক্যানভাস প্রসেসিং এবং রেন্ডারিং (১:১ স্কয়ার রেশিও) ---
      const canvasSize = 1000;
      const canvas = createCanvas(canvasSize, canvasSize);
      const ctx = canvas.getContext("2d");

      if (disableZoom) {
        // সম্পূর্ণ ইউজার ইমেজটি কোন প্রকার জুম বা ক্রপ ছাড়া ফিট হবে
        ctx.drawImage(mainImage, 0, 0, canvasSize, canvasSize);
      } else {
        // ম্যাথমেটিক্যাল ক্যালকুলেশন দিয়ে সেন্ট্রাল জুম ও ক্রপিং ট্র্যান্সফর্ম
        const factor = zoomPercent / 100;
        const cropWidth = mainImage.width * (1 - factor);
        const cropHeight = mainImage.height * (1 - factor);
        const cropX = (mainImage.width - cropWidth) / 2;
        const cropY = (mainImage.height - cropHeight) / 2;

        ctx.drawImage(
          mainImage,
          cropX, cropY, cropWidth, cropHeight, // সোর্স ডাইমেনশনস
          0, 0, canvasSize, canvasSize        // ডেস্টিনেশন ক্যানভাস লেআউট
        );
      }

      // ছবির ঠিক উপরে আলফা-মাস্কড ট্রান্সপারেন্ট ফ্রেম এবং লোগো লেয়ারটি ব্লেন্ড করা
      ctx.drawImage(frameImage, 0, 0, canvasSize, canvasSize);

      // --- বাফার এক্সপোর্ট এবং ফাইল রেসপন্স স্ট্রিম ---
      const outPath = path.join(dir, `acs_output_${event.senderID}_${Date.now()}.png`);
      const buffer = canvas.toBuffer("image/png");
      await fs.writeFile(outPath, buffer);

      const responseText = `✅ সফলভাবে ফ্রেম সেট করা হয়েছে!\n🔍 জুম স্ট্যাটাস: ${disableZoom ? 'বন্ধ (Off)' : zoomPercent + '%'}\n👑 Powered by ACS RAKIB`;

      await message.reply(
        {
          body: responseText,
          attachment: fs.createReadStream(outPath)
        },
        // Marry.js ফাইলের মতো নিখুঁতভাবে কলব্যাক ফাংশনে ক্যাশ ফাইলটি ডিলিট এবং মেমোরি রিলিজ করা
        () => {
          fs.unlink(outPath).catch(() => {});
          canvas.width = canvas.height = 0;
          if (global.gc) global.gc();
        }
      );

    } catch (err) {
      console.error("❌ ACS Command Error:", err);
      return message.reply(`❌ ইমেজ জেনারেট করার সময় ব্যাকএন্ডে সমস্যা হয়েছে: ${err.message}`);
    }
  }
};
            
