const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const GIFEncoder = require("gif-encoder-2");

module.exports.config = {
  name: "owner",
  version: "2.0.0",
  hasPermission: 0,
  credits: "Rakib Islam",
  description: "Animated RGB Owner Information Card",
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

/* =========================
   RGB COLOR
========================= */

function rgb(t) {
  const r = Math.sin(t) * 127 + 128;
  const g =
    Math.sin(t + (Math.PI * 2) / 3) * 127 + 128;
  const b =
    Math.sin(t + (Math.PI * 4) / 3) * 127 + 128;

  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

/* =========================
   ROUNDED RECT
========================= */

function roundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);

  ctx.beginPath();
  ctx.moveTo(x + radius, y);

  ctx.arcTo(
    x + w,
    y,
    x + w,
    y + h,
    radius
  );

  ctx.arcTo(
    x + w,
    y + h,
    x,
    y + h,
    radius
  );

  ctx.arcTo(
    x,
    y + h,
    x,
    y,
    radius
  );

  ctx.arcTo(
    x,
    y,
    x + w,
    y,
    radius
  );

  ctx.closePath();
}

/* =========================
   BACKGROUND
========================= */

function drawBackground(
  ctx,
  width,
  height,
  frame
) {
  const hue =
    (frame * 10) % 360;

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      width,
      height
    );

  gradient.addColorStop(
    0,
    `hsl(${hue},45%,6%)`
  );

  gradient.addColorStop(
    0.5,
    `hsl(${(hue + 80) % 360},40%,4%)`
  );

  gradient.addColorStop(
    1,
    `hsl(${(hue + 180) % 360},45%,7%)`
  );

  ctx.fillStyle = gradient;
  ctx.fillRect(
    0,
    0,
    width,
    height
  );

  /* Moving particles */

  for (let i = 0; i < 55; i++) {
    const x =
      (i * 83 +
        frame * (1 + (i % 3))) %
      width;

    const y =
      (i * 47 +
        frame * (i % 2)) %
      height;

    const size =
      0.7 + (i % 3) * 0.45;

    ctx.globalAlpha =
      0.2 +
      ((i + frame) % 5) / 10;

    ctx.fillStyle =
      rgb(
        frame * 0.08 +
        i * 0.25
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

/* =========================
   PROFILE IMAGE
========================= */

function drawProfile(
  ctx,
  image,
  cx,
  cy,
  radius,
  frame
) {
  ctx.save();

  /* RGB Glow */

  ctx.shadowBlur = 25;
  ctx.shadowColor =
    rgb(frame * 0.18);

  ctx.strokeStyle =
    rgb(frame * 0.18);

  ctx.lineWidth = 7;

  ctx.beginPath();

  ctx.arc(
    cx,
    cy,
    radius + 5,
    0,
    Math.PI * 2
  );

  ctx.stroke();

  ctx.shadowBlur = 0;

  /* Clip circle */

  ctx.beginPath();

  ctx.arc(
    cx,
    cy,
    radius,
    0,
    Math.PI * 2
  );

  ctx.clip();

  const scale =
    Math.max(
      (radius * 2) /
        image.width,
      (radius * 2) /
        image.height
    );

  const w =
    image.width * scale;

  const h =
    image.height * scale;

  ctx.drawImage(
    image,
    cx - w / 2,
    cy - h / 2,
    w,
    h
  );

  ctx.restore();
}

/* =========================
   DRAW CARD
========================= */

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

  /* Outer RGB Border */

  ctx.save();

  ctx.shadowBlur = 25;

  ctx.shadowColor =
    rgb(frame * 0.16);

  ctx.strokeStyle =
    rgb(frame * 0.16);

  ctx.lineWidth = 7;

  roundedRect(
    ctx,
    10,
    10,
    width - 20,
    height - 20,
    24
  );

  ctx.stroke();

  ctx.restore();

  /* Main Panel */

  ctx.save();

  roundedRect(
    ctx,
    32,
    32,
    width - 64,
    height - 64,
    20
  );

  ctx.fillStyle =
    "rgba(0,0,0,0.76)";

  ctx.fill();

  ctx.strokeStyle =
    "rgba(255,255,255,0.10)";

  ctx.lineWidth = 1;

  ctx.stroke();

  ctx.restore();

  /* Profile */

  drawProfile(
    ctx,
    profileImage,
    width / 2,
    115,
    66,
    frame
  );

  /* Name */

  ctx.save();

  ctx.textAlign = "center";

  ctx.font =
    "bold 29px Sans";

  ctx.shadowBlur = 15;

  ctx.shadowColor =
    rgb(frame * 0.18);

  ctx.fillStyle =
    rgb(frame * 0.18);

  ctx.fillText(
    OWNER.name.toUpperCase(),
    width / 2,
    210
  );

  ctx.restore();

  /* Information */

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
      const rowHeight = 45;

      ctx.save();

      roundedRect(
        ctx,
        62,
        y,
        width - 124,
        rowHeight - 6,
        8
      );

      ctx.fillStyle =
        index % 2 === 0
          ? "rgba(0,55,65,0.58)"
          : "rgba(0,90,90,0.45)";

      ctx.fill();

      ctx.strokeStyle =
        "rgba(255,255,255,0.08)";

      ctx.stroke();

      /* Label */

      ctx.textAlign = "left";

      ctx.font =
        "bold 15px Sans";

      ctx.fillStyle =
        rgb(
          frame * 0.18 +
          index * 0.7
        );

      ctx.fillText(
        `>> ${label}`,
        76,
        y + 26
      );

      /* Value */

      ctx.textAlign = "right";

      ctx.font =
        "15px Sans";

      ctx.fillStyle =
        "#eeeeee";

      ctx.fillText(
        String(value),
        width - 78,
        y + 26
      );

      ctx.restore();

      y += rowHeight;
    }
  );

  /* Bottom */

  ctx.save();

  ctx.textAlign = "center";

  ctx.font =
    "bold 13px Sans";

  ctx.fillStyle =
    "rgba(255,255,255,0.65)";

  ctx.fillText(
    "BOT OWNER",
    width / 2,
    height - 48
  );

  ctx.restore();
}

/* =========================
   GET PROFILE
========================= */

async function getProfileImage(api) {
  const info =
    await new Promise(
      (resolve, reject) => {
        api.getUserInfo(
          OWNER.uid,
          (err, data) => {
            if (err)
              return reject(err);

            resolve(
              data &&
              data[OWNER.uid]
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
      "Owner profile picture পাওয়া যায়নি."
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

/* =========================
   CREATE GIF
========================= */

async function createOwnerGif(
  api,
  outputPath
) {
  const width = 600;
  const height = 760;

  const frameCount = 30;

  const profileImage =
    await getProfileImage(api);

  /*
   * gif-encoder-2
   */

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

  /*
   * Start encoder
   */

  encoder.start();

  encoder.setRepeat(0);
  encoder.setDelay(90);
  encoder.setQuality(8);

  /*
   * Add frames
   */

  for (
    let frame = 0;
    frame < frameCount;
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

  /*
   * gif-encoder-2 output
   */

  const buffer =
    encoder.out.getData();

  await fs.outputFile(
    outputPath,
    buffer
  );

  return outputPath;
}

/* =========================
   COMMAND
========================= */

module.exports.onStart =
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

      /*
       * IMPORTANT:
       * এখানে event.messageID callback
       * হিসেবে পাঠানো যাবে না।
       */

      await new Promise(
        (resolve, reject) => {
          api.sendMessage(
            "⏳ 𝐎𝐰𝐧𝐞𝐫 𝐂𝐚𝐫𝐝 𝐜𝐫𝐞𝐚𝐭𝐢𝐧𝐠...",
            event.threadID,
            (err) => {
              if (err)
                return reject(err);

              resolve();
            },
            event.messageID
          );
        }
      );

      await createOwnerGif(
        api,
        outputPath
      );

      /*
       * Send GIF
       */

      await new Promise(
        (resolve, reject) => {
          api.sendMessage(
            {
              body:
                "👑 𝐎𝐖𝐍𝐄𝐑 𝐈𝐍𝐅𝐎\n\n" +
                "𝐑𝐚𝐤𝐢𝐛 𝐈𝐬𝐥𝐚𝐦\n" +
                "━━━━━━━━━━━━━━\n" +
                "𝐁𝐨𝐭 𝐎𝐰𝐧𝐞𝐫"
              ,
              attachment:
                fs.createReadStream(
                  outputPath
                )
            },
            event.threadID,
            (err) => {
              if (err)
                return reject(err);

              resolve();
            },
            event.messageID
          );
        }
      );

      /*
       * Delete generated GIF
       */

      await fs.remove(
        outputPath
      ).catch(() => {});

    } catch (error) {
      console.error(
        "[OWNER GIF ERROR]",
        error
      );

      await fs.remove(
        outputPath
      ).catch(() => {});

      return api.sendMessage(
        "❌ 𝐎𝐰𝐧𝐞𝐫 𝐆𝐈𝐅 তৈরি করা যায়নি.\n\n" +
        String(
          error.message || error
        ),
        event.threadID,
        event.messageID
      );
    }
  };
