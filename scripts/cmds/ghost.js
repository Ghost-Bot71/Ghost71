/**
 * Ghost / Stealth Mode — Ghost Bot
 * When ON: bot is completely invisible — no responses, no reactions, no replies
 * ONLY the ghost command itself still works to turn it off
 * Author: Rakib Islam
 */

"use strict";

const fs   = require("fs-extra");
const path = require("path");

const STATE_FILE = path.join(__dirname, "cache", "ghost-mode.json");

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {}
  return { enabled: false };
}

function saveState(state) {
  try {
    fs.ensureDirSync(path.dirname(STATE_FILE));
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch {}
}

// Restore state on startup
if (!global.ghostMode) {
  global.ghostMode = loadState();
}

module.exports = {
  config: {
    name: "ghost",
    aliases: ["stealth", "invisible"],
    version: "1.0",
    author: "Rakib Islam",
    countDown: 0,
    role: 2,
    description: {
      en: "Toggle ghost/stealth mode — bot becomes completely invisible"
    },
    category: "owner",
    guide: {
      en: "{pn} on  — bot becomes invisible (no responses except this cmd)\n"
        + "{pn} off — bot comes back online\n"
        + "{pn}     — check current status"
    }
  },

  langs: {
    en: {
      on:     "👻 Ghost Mode ACTIVATED!\n\nBot is now completely invisible.\n"
            + "• No responses to any command\n"
            + "• No reactions, no replies\n"
            + "• Only `ghost off` will wake me up\n\n"
            + "🔕 Enemies won't know I'm watching... 👁️",
      off:    "👁️ Ghost Mode DEACTIVATED!\n\nBot is back online!\n"
            + "• All commands work normally\n"
            + "• Reactions and replies restored\n\n"
            + "✅ I'm alive again!",
      status: "📊 Ghost Mode Status: %1\n\nUse `ghost on` to hide, `ghost off` to show."
    }
  },

  onStart: async function ({ args, message, getLang }) {
    const sub = (args[0] || "").toLowerCase();

    if (sub === "on") {
      global.ghostMode = { enabled: true, command: "ghost" };
      saveState(global.ghostMode);
      return message.reply(getLang("on"));
    }

    if (sub === "off") {
      global.ghostMode = { enabled: false };
      saveState(global.ghostMode);
      return message.reply(getLang("off"));
    }

    const status = global.ghostMode?.enabled ? "🔴 ON (Invisible)" : "🟢 OFF (Visible)";
    return message.reply(getLang("status", status));
  }
};
