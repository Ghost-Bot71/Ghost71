const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const GHOST = fs.readJsonSync(path.join(__dirname, "../../ghostConfig.json"));

const BASE_API_URL = "https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json";
async function getApiBase() {
  try {
    const r = await axios.get(BASE_API_URL, { timeout: 8000 });
    return r.data.api;
  } catch { return "https://dipto-the-best.vercel.app"; }
}

const THEMES = {
  neon:    { bg: "050510", t1: "00ffff", t2: "ff00ff", label: "⚡ Neon Cyber" },
  fire:    { bg: "0d0000", t1: "ff4400", t2: "ffaa00", label: "🔥 Fire Burn"   },
  ice:     { bg: "00080d", t1: "00ccff", t2: "aaddff", label: "❄️ Ice Crystal" },
  galaxy:  { bg: "050010", t1: "cc66ff", t2: "6600cc", label: "🌌 Galaxy Dark"  },
  gold:    { bg: "0d0800", t1: "ffd700", t2: "ff8c00", label: "🏆 Gold King"   },
  matrix:  { bg: "000d00", t1: "00ff41", t2: "007a1f", label: "💚 Matrix Code" },
  rose:    { bg: "0d0008", t1: "ff66aa", t2: "ff0055", label: "🌹 Rose Dark"   },
  ocean:   { bg: "000a14", t1: "0088ff", t2: "00ddff", label: "🌊 Deep Ocean"  },
};

module.exports = {
  config: {
    name: "neoncover",
    aliases: ["nc", "neoncv", "cybercv", "ncover"],
    version: "1.0",
    author: "Rakib Islam",
    countDown: 10,
    role: 0,
    shortDescription: "⚡ Neon Aesthetic Cover — 8 glow themes",
    longDescription: "নিজের নাম ও title দিয়ে neon/cyber aesthetic Facebook cover photo তৈরি করো। 8টা glow theme আছে।",
    category: "image",
    guide: [
      "{pn} [name] - [title] - [theme]",
      "Example: .neoncover Rakib Islam - Bot Developer - neon",
      "Example: .neoncover Ghost Bot - Ghost Net Edition - galaxy",
      "{pn} themes — সব theme দেখো",
      "Themes: neon, fire, ice, galaxy, gold, matrix, rose, ocean",
    ].join("\n"),
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;

    if (args[0] === "themes" || args[0] === "list") {
      const list = Object.entries(THEMES).map(([k, v]) => `• .neoncover name - title - ${k} — ${v.label}`).join("\n");
      return message.reply(
        `⚡ 𝗡𝗲𝗼𝗻 𝗖𝗼𝘃𝗲𝗿 𝗧𝗵𝗲𝗺𝗲𝘀\n━━━━━━━━━━━━━━━━━━\n${list}\n━━━━━━━━━━━━━━━━━━\n👻 Ghost Bot — ${GHOST.ownerName}`
      );
    }

    const input = args.join(" ");
    const parts = input.split("-").map(s => s.trim());
    const name = parts[0] || "Ghost Bot";
    const title = parts[1] || "Ghost Net Edition";
    const themeKey = (parts[2] || "neon").toLowerCase();

    const theme = THEMES[themeKey] || THEMES.neon;

    api.setMessageReaction("⚡", messageID, () => {}, true);

    const targetID = Object.keys(mentions || {})[0] || messageReply?.senderID || senderID;
    const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;

    const cardUrl = `https://api.popcat.xyz/welcomecard?background=${theme.bg}&text1=${encodeURIComponent(name)}&text2=${encodeURIComponent(title)}&text3=${encodeURIComponent(theme.label + ' | Ghost Bot')}&avatar=${encodeURIComponent(avatarUrl)}`;

    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);
    const outPath = path.join(cacheDir, `neoncover_${Date.now()}.png`);

    let imgBuffer;
    try {
      const res = await axios.get(cardUrl, { responseType: "arraybuffer", timeout: 15000 });
      imgBuffer = Buffer.from(res.data);
      if (imgBuffer.length < 1000) throw new Error("fallback");
    } catch {
      try {
        const base = await getApiBase();
        const fallUrl = `${base}/fbcover?v=v3&name=${encodeURIComponent(name)}&title=${encodeURIComponent(title)}&address=${encodeURIComponent(theme.label)}&email=ghost%40bot.com&phone=Ghost+Bot&color=purple&avatar=${encodeURIComponent(avatarUrl)}`;
        const res2 = await axios.get(fallUrl, { responseType: "arraybuffer", timeout: 15000 });
        imgBuffer = Buffer.from(res2.data);
      } catch (e) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return message.reply(`❌ Neon cover তৈরি করা যায়নি।\nError: ${e.message}`);
      }
    }

    await fs.writeFile(outPath, imgBuffer);

    await api.sendMessage(
      {
        body: `⚡ 𝗡𝗲𝗼𝗻 𝗔𝗲𝘀𝘁𝗵𝗲𝘁𝗶𝗰 𝗖𝗼𝘃𝗲𝗿\n━━━━━━━━━━━━━━━━━━\n👤 Name: ${name}\n🏷️ Title: ${title}\n🎨 Theme: ${theme.label}\n━━━━━━━━━━━━━━━━━━\n👻 Ghost Bot — ${GHOST.ownerName}`,
        attachment: fs.createReadStream(outPath),
      },
      threadID,
      () => { try { fs.unlinkSync(outPath); } catch {} },
      messageID
    );
    api.setMessageReaction("✅", messageID, () => {}, true);
  }
};
