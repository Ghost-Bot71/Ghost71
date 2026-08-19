const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const GIFEncoder = require("gifencoder");

module.exports.config = {
  name: "owner",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Rakib Islam",
  description: "Animated RGB owner information card",
  commandCategory: "info",
  usages: "",
  cooldowns: 10
};

const OWNER = {
  name: "Rakib Islam",
  location: "Saidpur, Nilphamary",
  relationship: "Single",
  region: "Islam",
  className: "Hidden",
  prefix: ".",
  role: "Bot Owner",
  uid: "61592104482524"
};

function rgb(t) {
  const r = Math.sin(t) * 127 + 128;
  const g =
    Math.sin(t + (Math.PI * 2) / 3) * 127 + 128;
  const b =
    Math.sin(t + (Math.PI * 4) / 3) * 127 + 128;

  return `rgb(${r | 0}, ${g | 0}, ${b | 0})`;
}

function roundedRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);

  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawBackground(ctx, width, height, frame) {
  const hue = (frame * 8) % 360;

  const bg = ctx.createLinearGradient(
    0,
    0,
    width,
    height
  );

  bg.addColorStop(
    0,
    `hsl(${hue}, 45%, 7%)`
  );

  bg.addColorStop(
    0.5,
    `hsl(${(hue + 80) % 360}, 40%, 5%)`
  );

  bg.addColorStop(
    1,
    `hsl(${(hue + 180) % 360}, 45%, 7%)`
  );

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Moving stars / particles
  for (let i = 0; i < 45; i++) {
    const x =
      (i * 83 + frame * (1 + (i % 3))) %
      width;

    const y =
      (i * 47 + frame * (i % 2)) %
      height;

    const size =
      0.7 + (i % 3) * 0.45;

    ctx.globalAlpha =
      0.25 + ((i + frame) % 5) / 10;

    ctx.fillStyle = rgb(
      frame * 0.08 + i * 0.25
    );

    ctx.beginPath();
    ctx.arc(
      x,
      y,
      size,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

function drawProfile(
  ctx,
  image,
  cx,
  cy,
  radius,
  frame
) {
  ctx.save();

  // RGB glow
  ctx.shadowBlur = 22;
  ctx.shadowColor = rgb(frame * 0.18);

  ctx.strokeStyle = rgb(frame * 0.18);
  ctx.lineWidth = 7;

  ctx.beginPath();
  ctx.arc(
    cx,
    cy,
    radius + 4,
    0,
    Math.PI * 2
  );

  ctx.stroke();

  ctx.shadowBlur = 0;

  // Circular profile image
  ctx.beginPath();
  ctx.arc(
    cx,
    cy,
    radius,
    0,
    Math.PI * 2
  );

  ctx.clip();

  const scale = Math.max(
    (radius * 2) / image.width,
    (radius * 2) / image.height
  );

  const w = image.width * scale;
  const h = image.height * scale;

  ctx.drawImage(
    image,
    cx - w / 2,
    cy - h / 2,
    w,
    h
  );

  ctx.restore();
}

function drawCard(
  ctx,
  width,
  height,
  frame,
  profileImage
) {
  drawBackground(
    ctx,
    width,
    height,
    frame
  );

  // Outer RGB border
  ctx.save();

  ctx.shadowBlur = 24;
  ctx.shadowColor = rgb(frame * 0.16);

  ctx.strokeStyle = rgb(frame * 0.16);
  ctx.lineWidth = 7;

  roundedRect(
    ctx,
    10,
    10,
    width - 20,
    height - 20,
    22
  );

  ctx.stroke();
  ctx.restore();

  // Main black panel
  ctx.save();

  roundedRect(
    ctx,
    34,
    34,
    width - 68,
    height - 68,
    18
  );

  ctx.fillStyle =
    "rgba(0, 0, 0, 0.72)";

  ctx.fill();

  ctx.strokeStyle =
    "rgba(255,255,255,0.10)";

  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();

  // Profile
  drawProfile(
    ctx,
    profileImage,
    width / 2,
    115,
    65,
    frame
  );

  // Name
  ctx.save();

  ctx.textAlign = "center";
  ctx.font = "bold 29px Sans";

  ctx.shadowBlur = 15;
  ctx.shadowColor = rgb(frame * 0.18);

  ctx.fillStyle = rgb(
    frame * 0.18
  );

  ctx.fillText(
    OWNER.name.toUpperCase(),
    width / 2,
    210
  );

  ctx.restore();

  const rows = [
    ["LOCATION", OWNER.location],
    ["RELATIONSHIP", OWNER.relationship],
    ["REGION", OWNER.region],
    ["CLASS", OWNER.className],
    ["PREFIX", OWNER.prefix],
    ["ROLE", OWNER.role]
  ];

  let y = 250;

  rows.forEach(
    ([label, value], index) => {
      const rowH = 45;

      ctx.save();

      roundedRect(
        ctx,
        62,
        y,
        width - 124,
        rowH - 6,
        8
      );

      ctx.fillStyle =
        index % 2
          ? "rgba(0, 90, 90, 0.48)"
          : "rgba(0, 55, 65, 0.55)";

      ctx.fill();

      ctx.strokeStyle =
        "rgba(255,255,255,0.08)";

      ctx.stroke();

      // Left text
      ctx.textAlign = "left";
      ctx.font = "bold 15px Sans";

      ctx.fillStyle = rgb(
        frame * 0.18 + index * 0.7
      );

      ctx.fillText(
        `>> ${label}`,
        76,
        y + 26
      );

      // Right text
      ctx.textAlign = "right";
      ctx.font = "15px Sans";
      ctx.fillStyle = "#eeeeee";

      ctx.fillText(
        String(value),
        width - 78,
        y + 26
      );

      ctx.restore();

      y += rowH;
    }
  );

  // Bottom text
  ctx.save();

  ctx.textAlign = "center";
  ctx.font = "bold 13px Sans";

  ctx.fillStyle =
    "rgba(255,255,255,0.65)";

  ctx.fillText(
    "✦ BOT OWNER ✦",
    width / 2,
    height - 48
  );

  ctx.restore();
}

async function getProfileImage(api) {
  const info = await new Promise(
    (resolve, reject) => {
      api.getUserInfo(
        OWNER.uid,
        (err, data) => {
          if (err) {
            return reject(err);
          }

          resolve(
            data && data[OWNER.uid]
          );
        }
      );
    }
  );

  if (
    !info ||
    !info.thumbSrc
  ) {
    throw new Error(
      "Could not get the owner's profile picture."
    );
  }

  const response =
    await axios.get(
      info.thumbSrc,
      {
        responseType:
          "arraybuffer",
        timeout: 20000
      }
    );

  return loadImage(
    Buffer.from(
      response.data
    )
  );
}

async function createOwnerGif(
  api,
  outputPath
) {
  const width = 600;
  const height = 760;

  // Number of GIF frames
  const frames = 30;

  const profileImage =
    await getProfileImage(api);

  const encoder =
    new GIFEncoder(
      width,
      height
    );

  const canvas =
    createCanvas(
      width,
      height
    );

  const ctx =
    canvas.getContext("2d");

  encoder.start();

  // Infinite loop
  encoder.setRepeat(0);

  // Frame delay
  encoder.setDelay(90);

  // GIF quality
  encoder.setQuality(8);

  for (
    let frame = 0;
    frame < frames;
    frame++
  ) {
    drawCard(
      ctx,
      width,
      height,
      frame,
      profileImage
    );

    encoder.addFrame(ctx);
  }

  encoder.finish();

  await new Promise(
    (resolve, reject) => {
      const output =
        fs.createWriteStream(
          outputPath
        );

      const stream =
        encoder.createReadStream();

      stream.on(
        "error",
        reject
      );

      output.on(
        "error",
        reject
      );

      output.on(
        "finish",
        resolve
      );

      stream.pipe(output);
    }
  );
}

module.exports.run =
  async function ({
    api,
    event
  }) {
    const cacheDir =
      path.join(
        __dirname,
        "cache"
      );

    const outputPath =
      path.join(
        cacheDir,
        `owner_${event.senderID}_${Date.now()}.gif`
      );

    try {
      await fs.ensureDir(
        cacheDir
      );

      api.sendMessage(
        "⏳ RGB Owner GIF তৈরি হচ্ছে...",
        event.threadID,
        event.messageID
      );

      await createOwnerGif(
        api,
        outputPath
      );

      return api.sendMessage(
        {
          body:
            "👑 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢",

          attachment:
            fs.createReadStream(
              outputPath
            )
        },

        event.threadID,

        () => {
          fs.remove(
            outputPath
          ).catch(() => {});
        }
      );
    } catch (error) {
      console.error(
        "Owner GIF Error:",
        error
      );

      await fs.remove(
        outputPath
      ).catch(() => {});

      return api.sendMessage(
        `❌ Owner GIF তৈরি করা যায়নি.\n\n${
          error.message || error
        }`,

        event.threadID,

        event.messageID
      );
    }
  };
