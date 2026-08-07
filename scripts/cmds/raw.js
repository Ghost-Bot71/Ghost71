const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "raw",
    aliases: ["bin", "pastebin"],
    version: "1.0",
    author: "xalman",
    countDown: 5,
    role: 2,
    shortDescription: "Upload file to Pastebin and get raw link",
    longDescription: "Upload a command file to Pastebin and return the raw link",
    category: "owner",
    guide: "{pn} <filename>"
  },

  onStart: async function ({ message, args, api, event }) {
    const fileName = args[0];
    if (!fileName) {
      return api.sendMessage("Please provide a file name.\nExample: /raw kill.js", event.threadID, event.messageID);
    }

    const filePath = path.join(__dirname, `${fileName}`);
    if (!fs.existsSync(filePath)) {
      const files = fs.readdirSync(__dirname).filter(f => f.endsWith(".js"));
      const suggestions = files.filter(f => f.toLowerCase().includes(fileName.toLowerCase()));
      if (suggestions.length > 0) {
        return api.sendMessage(
          `File not found: ${fileName}\n\nDid you mean:\n- ${suggestions.join("\n- ")}`,
          event.threadID,
          event.messageID
        );
      }
      return api.sendMessage(
        `File not found: ${fileName}\n\nAvailable files:\n- ${files.join("\n- ")}`,
        event.threadID,
        event.messageID
      );
    }

    try {
      const fileContent = fs.readFileSync(filePath, "utf8");
      const encodedContent = encodeURIComponent(fileContent);
      const apiUrl = `https://xalman-apis.vercel.app/api/pastebin?text=${encodedContent}`;

      const response = await axios.get(apiUrl, { timeout: 15000 });

      if (response.data && response.data.status && response.data.result) {
        const rawUrl = response.data.result.raw;
        return api.sendMessage(
          `📄 ${fileName}\n🔗 ${rawUrl}`,
          event.threadID,
          event.messageID
        );
      } else {
        throw new Error("Invalid response from Pastebin API");
      }
    } catch (error) {
      console.error("Pastebin upload error:", error.message);
      return api.sendMessage(
        "❌ Failed to upload file to Pastebin. Please try again later.",
        event.threadID,
        event.messageID
      );
    }
  }
};
