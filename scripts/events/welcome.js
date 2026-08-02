const { getTime } = global.utils;
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require('canvas');

if (!global.temp.welcomeEvent)
    global.temp.welcomeEvent = {};

const backgroundImages = [
    "https://i.imgur.com/hRJZxJt.jpeg",
    "https://i.imgur.com/XlwZfh7.jpeg",
    "https://i.imgur.com/lZYcVAB.jpeg",
    "https://i.imgur.com/vAHABbs.jpeg",
    "https://i.imgur.com/3FINFm0.jpeg",
    "https://i.imgur.com/FSZM3UR.jpeg",
    "https://i.imgur.com/S6t4C2M.jpeg",
    "https://i.imgur.com/qmpQiny.jpeg"
];

const backgroundCache = new Map();

async function loadBackgroundImage(url) {
    if (backgroundCache.has(url)) return backgroundCache.get(url);
    try {
        const response = await axios.get(url, {
            responseType: "arraybuffer",
            headers: { "User-Agent": "Mozilla/5.0" }
        });
        const img = await loadImage(Buffer.from(response.data));
        backgroundCache.set(url, img);
        return img;
    } catch (error) {
        return null;
    }
}

async function drawProfileImage(ctx, imageUrl, x, y, size, borderColor, glowColor) {
    const radius = size / 2;
    try {
        const response = await axios.get(imageUrl, {
            responseType: "arraybuffer",
            headers: { "User-Agent": "Mozilla/5.0" }
        });
        const img = await loadImage(Buffer.from(response.data));

        ctx.shadowColor = glowColor || borderColor;
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(x, y, radius + 10, 0, Math.PI * 2);
        ctx.fillStyle = borderColor;
        ctx.fill();
        ctx.shadowBlur = 0;

        const gradient = ctx.createRadialGradient(x - 8, y - 8, 0, x, y, radius + 6);
        gradient.addColorStop(0, borderColor);
        gradient.addColorStop(0.5, glowColor || borderColor);
        gradient.addColorStop(1, "#ffffff");
        ctx.beginPath();
        ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.shadowColor = "rgba(255,255,255,0.3)";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, x - radius, y - radius, size, size);
        ctx.restore();

        return true;
    } catch (error) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#374151';
        ctx.fill();
        ctx.fillStyle = borderColor;
        ctx.font = `bold ${radius * 0.6}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('U', x, y);
        return false;
    }
}

function drawGlowText(ctx, text, x, y, font, color, shadowColor, shadowBlur) {
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = shadowBlur;
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;
}

function drawDiamond(ctx, x, y, size, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.fillRect(-size/2, -size/2, size, size);
    ctx.shadowBlur = 0;
    ctx.restore();
}

async function createWelcomeCard(gcImg, userImg, adderImg, userName, userNumber, threadName, adderName) {
    const width = 1400;
    const height = 800;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const selectedBackground = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
    const background = await loadBackgroundImage(selectedBackground);
    
    if (background) {
        ctx.drawImage(background, 0, 0, width, height);
    } else {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#0f0c29');
        gradient.addColorStop(0.5, '#302b63');
        gradient.addColorStop(1, '#24243e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    const overlay = ctx.createRadialGradient(width/2, height/2, 100, width/2, height/2, 800);
    overlay.addColorStop(0, "rgba(0,0,0,0.1)");
    overlay.addColorStop(1, "rgba(0,0,0,0.6)");
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, width, height);

    ctx.shadowColor = "rgba(247, 151, 30, 0.4)";
    ctx.shadowBlur = 30;
    const mainGradient = ctx.createLinearGradient(0, 0, width, 0);
    mainGradient.addColorStop(0, "rgba(247, 151, 30, 0)");
    mainGradient.addColorStop(0.15, "rgba(247, 151, 30, 0.6)");
    mainGradient.addColorStop(0.5, "#ffd200");
    mainGradient.addColorStop(0.85, "rgba(247, 151, 30, 0.6)");
    mainGradient.addColorStop(1, "rgba(247, 151, 30, 0)");
    ctx.fillStyle = mainGradient;
    ctx.fillRect(50, 0, width - 100, 5);
    ctx.fillRect(50, height - 5, width - 100, 5);
    ctx.shadowBlur = 0;

    ctx.shadowColor = "rgba(247, 151, 30, 0.2)";
    ctx.shadowBlur = 20;
    ctx.strokeStyle = "rgba(247, 151, 30, 0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, width - 60, height - 60);
    ctx.shadowBlur = 0;

    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x = width/2 + Math.cos(angle) * 550;
        const y = height/2 + Math.sin(angle) * 300;
        drawDiamond(ctx, x, y, 6, "rgba(247, 151, 30, 0.15)");
    }

    await drawProfileImage(ctx, gcImg, width / 2, 210, 180, "#f7971e", "#ffd200");
    await drawProfileImage(ctx, userImg, 150, height - 130, 160, "#ff6b6b", "#ffd93d");
    await drawProfileImage(ctx, adderImg, width - 150, 130, 150, "#4ecdc4", "#44bd9e");

    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 15;
    ctx.font = 'bold 44px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(threadName, width / 2, 375);
    ctx.shadowBlur = 0;

    drawGlowText(
        ctx,
        "✦ WELCOME ✦",
        width / 2, 490,
        'bold 90px "Segoe UI", Arial, sans-serif',
        "#ffd200",
        "rgba(247, 151, 30, 0.5)",
        30
    );

    ctx.shadowColor = "rgba(255, 215, 0, 0.2)";
    ctx.shadowBlur = 10;
    const underGradient = ctx.createLinearGradient(width/2 - 200, 0, width/2 + 200, 0);
    underGradient.addColorStop(0, "rgba(247, 151, 30, 0)");
    underGradient.addColorStop(0.1, "rgba(247, 151, 30, 0.6)");
    underGradient.addColorStop(0.5, "#ffd200");
    underGradient.addColorStop(0.9, "rgba(247, 151, 30, 0.6)");
    underGradient.addColorStop(1, "rgba(247, 151, 30, 0)");
    ctx.fillStyle = underGradient;
    ctx.fillRect(width/2 - 200, 515, 400, 3);
    ctx.shadowBlur = 0;

    drawGlowText(
        ctx,
        userName,
        width / 2, 570,
        'bold 56px "Segoe UI", Arial, sans-serif',
        "#ffffff",
        "rgba(255, 107, 107, 0.4)",
        20
    );

    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 8;
    ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText(`✦ Member #${userNumber} ✦`, width / 2, 625);
    ctx.shadowBlur = 0;

    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 8;
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffd93d";
    ctx.font = 'bold 26px "Segoe UI", Arial, sans-serif';
    ctx.fillText(`✦ ${userName}`, 280, height - 125);
    
    ctx.fillStyle = "rgba(255, 217, 61, 0.2)";
    ctx.fillRect(280, height - 118, 180, 2);

    ctx.textAlign = "right";
    ctx.fillStyle = "#4ecdc4";
    ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
    ctx.fillText(`Added by ${adderName} ✦`, width - 280, 135);
    
    ctx.fillStyle = "rgba(78, 205, 196, 0.2)";
    ctx.fillRect(width - 460, 142, 180, 2);

    ctx.shadowBlur = 0;
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.font = '14px "Segoe UI", Arial, sans-serif';
    ctx.fillText("✦ welcome v2.3 ✦", width - 30, height - 25);

    return canvas.toBuffer();
}

module.exports = {
    config: {
        name: "welcome",
        version: "2.3",
        author: "xalman",
        category: "events"
    },

    langs: {
        en: {
            session1: "morning",
            session2: "noon",
            session3: "afternoon",
            session4: "evening",
            welcomeMessage: "╔═════════════════╗\n       📥 ɪɴᴠɪᴛᴀᴛɪᴏɴ ᴀᴄᴄᴇᴘᴛᴇᴅ\n╚═════════════════╝\n━━━━━━━━━━━━━━━━━━\n✨ ᴘʀᴇꜰɪx: [ %1 ]\n📖 ᴛʏᴘᴇ [ %1ʜᴇʟᴘ ] ᴛᴏ ꜱᴇᴇ ᴍʏ ᴍᴇɴᴜ\n\n『 ᴛʜᴀɴᴋ ʏᴏᴜ ꜰᴏʀ ᴀᴅᴅɪɴɢ ᴍᴇ! 』",
            multiple1: "ɴᴇᴡ ꜱᴏᴜʟ",
            multiple2: "ɴᴇᴡ ꜱᴏᴜʟꜱ",
            defaultWelcomeMessage: "『 ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ᴛʜᴇ ᴄʟᴀɴ 』\n━━━━━━━━━━━━━━━━━━\n👋 ʜᴇʟʟᴏ, {userNameTag}!\n🏘️ ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ: {boxName}\n🕒 ʜᴀᴠᴇ ᴀ ɢᴏᴏᴅ {session}\n\n[ 📝 ɴᴏᴛᴇ: ᴘʟᴇᴀꜱᴇ ʀᴇᴀᴅ ᴛʜᴇ ɢʀᴏᴜᴘ ʀᴜʟᴇꜱ ᴄᴀʀᴇꜰᴜʟʟʏ ]"
        }
    },

    onStart: async ({ threadsData, message, event, api, getLang, usersData }) => {
        if (event.logMessageType !== "log:subscribe") return;

        const hours = getTime("HH");
        const { threadID } = event;
        const { nickNameBot } = global.GoatBot.config;
        const prefix = global.utils.getPrefix(threadID);
        const dataAddedParticipants = event.logMessageData.addedParticipants;

        if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
            if (nickNameBot)
                api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
            return message.send(getLang("welcomeMessage", prefix));
        }

        if (!global.temp.welcomeEvent[threadID])
            global.temp.welcomeEvent[threadID] = {
                joinTimeout: null,
                dataAddedParticipants: []
            };

        global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
        clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

        global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
            const threadData = await threadsData.get(threadID);
            if (threadData.settings.sendWelcomeMessage == false)
                return;

            const addedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
            const dataBanned = threadData.data.banned_ban || [];
            const threadName = threadData.threadName || "this group";
            const userName = [], mentions = [];
            let multiple = addedParticipants.length > 1;

            for (const user of addedParticipants) {
                if (dataBanned.some((item) => item.id == user.userFbId))
                    continue;
                userName.push(user.fullName);
                mentions.push({ tag: user.fullName, id: user.userFbId });
            }

            if (userName.length == 0) return;

            let { welcomeMessage = getLang("defaultWelcomeMessage") } = threadData.data;

            welcomeMessage = welcomeMessage
                .replace(/\{userNameTag\}|\{userName\}/g, userName.join(", "))
                .replace(/\{boxName\}|\{threadName\}/g, threadName)
                .replace(/\{multiple\}/g, multiple ? getLang("multiple2") : getLang("multiple1"))
                .replace(/\{session\}/g, hours <= 10 ? getLang("session1") : hours <= 12 ? getLang("session2") : hours <= 18 ? getLang("session3") : getLang("session4"));

            try {
                const firstUser = addedParticipants[0];
                const adderID = event.author;
                
                let userAvatar = await usersData.getAvatarUrl(firstUser.userFbId);
                let adderAvatar = await usersData.getAvatarUrl(adderID);
                let groupImage = threadData.imageSrc || `https://graph.facebook.com/${threadID}/picture?width=720&height=720`;
                let adderName = await usersData.getName(adderID) || "Unknown";
                let memberCount = threadData.members?.length || 1;

                const imageBuffer = await createWelcomeCard(
                    groupImage,
                    userAvatar,
                    adderAvatar,
                    firstUser.fullName,
                    memberCount,
                    threadName,
                    adderName
                );

                const tempDir = path.join(__dirname, '..', 'cache');
                await fs.ensureDir(tempDir);
                const tempPath = path.join(tempDir, `welcome_${Date.now()}.png`);
                fs.writeFileSync(tempPath, imageBuffer);

                await message.send({
                    body: welcomeMessage,
                    attachment: fs.createReadStream(tempPath),
                    mentions: mentions
                });

                setTimeout(() => {
                    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
                }, 10000);

            } catch (error) {
                console.error("[WELCOME] Card creation error:", error);
                await message.send({
                    body: welcomeMessage,
                    mentions: mentions
                });
            }

            delete global.temp.welcomeEvent[threadID];
        }, 400);
    }
};
