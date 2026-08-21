/**
 * Anime Girl Voice Command
 * Ghost Bot — Rakib Islam | Ghost Net Edition
 * Uses Hugging Face TTS for anime-style voice
 */

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const GHOST = fs.readJsonSync(path.join(__dirname, "../../ghostConfig.json"));

const HF_TOKEN = process.env.HF_TOKEN || "";

async function generateAnimeVoice(text) {
  const models = [
    "espnet/kan-bayashi_ljspeech_vits",
    "facebook/mms-tts-eng",
    "suno/bark-small"
  ];

  for (const model of models) {
    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${model}`,
        { inputs: text },
        {
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json"
          },
          responseType: "arraybuffer",
          timeout: 30000
        }
      );
      if (response.data && response.data.byteLength > 1000) {
        return { data: Buffer.from(response.data), model };
      }
    } catch (e) {
      continue;
    }
  }
  throw new Error("All TTS models failed");
}

module.exports = {
  config: {
    name: "animegirl",
    aliases: ["agirl", "animevoice"],
    version: "1.0",
    author: "Rakib Islam",
    countDown: 10,
    role: 0,
    shortDescription: "Anime girl voice তৈরি করো",
    longDescription: "যেকোনো text কে anime girl voice এ convert করো (HuggingFace TTS)",
    category: "fun",
    guide: "{pn} [text]",
  },
  onStart: async function ({ api, event, args, message }) {
    if (!args[0]) {
      return message.reply(
        `🎀 𝗔𝗻𝗶𝗺𝗲 𝗚𝗶𝗿𝗹 𝗩𝗼𝗶𝗰𝗲\n\n` +
        `Usage: .animegirl [text]\n` +
        `Example: .animegirl Hello! I am Ghost Bot~\n\n` +
        `✨ Anime-style TTS by HuggingFace\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `👻 Ghost Bot — ${GHOST.ownerName}`
      );
    }

    const text = args.join(" ").slice(0, 200);
    const processing = await message.reply(`🎀 Anime girl voice বানাচ্ছি...\n✨ "${text}"`);

    try {
      const tmpPath = path.join(__dirname, "../cmds/cache", `animegirl_${Date.now()}.mp3`);
      fs.ensureDirSync(path.dirname(tmpPath));

      const { data, model } = await generateAnimeVoice(text);
      fs.writeFileSync(tmpPath, data);

      await api.sendMessage(
        {
          body: `🎀 𝗔𝗻𝗶𝗺𝗲 𝗚𝗶𝗿𝗹 𝗩𝗼𝗶𝗰𝗲 ✨\n\n💬 Text: "${text}"\n🤖 Model: ${model.split("/")[1]}\n\n━━━━━━━━━━━━━━━━━━\n👻 Ghost Bot — ${GHOST.ownerName}`,
          attachment: fs.createReadStream(tmpPath)
        },
        event.threadID,
        () => fs.unlinkSync(tmpPath)
      );
    } catch (err) {
      message.reply(
        `❌ Voice generate করা যায়নি।\n\nError: ${err.message}\n\n` +
        `💡 HF_TOKEN check করো অথবা পরে try করো।\n\n━━━━━━━━━━━━━━━━━━\n👻 Ghost Bot`
      );
    }
  }
};
