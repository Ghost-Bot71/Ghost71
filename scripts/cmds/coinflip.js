"use strict";

const { buildCyberpunkGif } = require("../helpers/cyberpunkGif");
const { amount, wallet, write } = require("../helpers/economy");

module.exports = {
  config: {
    name: "coinflip",
    aliases: ["flip", "coin"],
    version: "1.0",
    author: "Ew'r Hinata",
    countDown: 5,
    role: 0,
    shortDescription: "🪙 Persistent heads/tails betting game",
    category: "game",
    guide: { en: "{pn} heads <amount> | {pn} tails <amount>" }
  },

  onStart: async function ({ message, event, args, usersData }) {
    const choice = String(args[0] || "").toLowerCase();
    const bet = amount(args[1]);
    if (!["heads", "tails", "head", "tail", "h", "t"].includes(choice) || !Number.isSafeInteger(bet) || bet <= 0) {
      return message.reply("🪙 ব্যবহার: .coinflip heads 1000 অথবা .coinflip tails 1K");
    }
    const user = await usersData.get(event.senderID);
    const before = wallet(user);
    if (bet > before) return message.reply(`❌ Balance কম। তোমার ৳${before.toLocaleString("en-US")}, bet ৳${bet.toLocaleString("en-US")}`);

    const actual = Math.random() < 0.5 ? "heads" : "tails";
    const picked = choice.startsWith("h") ? "heads" : "tails";
    const won = picked === actual;
    const after = before - bet + (won ? bet * 2 : 0);
    await write(usersData, event.senderID, user, after);
    const body = `🪙 ${actual.toUpperCase()}!\n${won ? "🎉 You won!" : "💔 You lost!"}\n💵 Bet: ৳${bet.toLocaleString("en-US")}\n💰 Balance: ৳${after.toLocaleString("en-US")}`;
    const gif = await buildCyberpunkGif({ title: "EWR HINATA", subtitle: won ? "COIN WIN" : "COIN FLIP" });
    return message.reply(gif ? { body, attachment: gif } : body);
  }
};