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

function drawFlower(ctx, x, y, size, color, petalCount, rotation) {
    const petals = petalCount || 8;
    const radius = size / 2;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation || 0);
    
    for (let i = 0; i < petals; i++) {
        const angle = (i / petals) * Math.PI * 2;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(angle);
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 0.6, radius * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
    }
    
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 25;
    ctx.fillStyle = "#ffd700";
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
}

function drawStar(ctx, x, y, size, color, rotation, glow, points) {
    const p = points || 5;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation || 0);
    if (glow) {
        ctx.shadowColor = color;
        ctx.shadowBlur = glow;
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < p * 2; i++) {
        const angle = (i * Math.PI / p) - Math.PI / 2;
        const radius = i % 2 === 0 ? size : size * 0.4;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
}

function drawDiamond(ctx, x, y, size, color, glow, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation || Math.PI / 4);
    if (glow) {
        ctx.shadowColor = color;
        ctx.shadowBlur = glow;
    }
    ctx.fillStyle = color;
    ctx.fillRect(-size/2, -size/2, size, size);
    ctx.shadowBlur = 0;
    ctx.restore();
}

function drawCirclePattern(ctx, x, y, radius, color, count) {
    const c = count || 12;
    ctx.save();
    for (let i = 0; i < c; i++) {
        const angle = (i / c) * Math.PI * 2;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(px, py, radius * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    ctx.restore();
}

function drawMandala(ctx, x, y, radius, color, layers) {
    const l = layers || 3;
    ctx.save();
    for (let layer = 0; layer < l; layer++) {
        const r = radius * (1 - layer * 0.25);
        const count = 8 + layer * 4;
        ctx.globalAlpha = 0.3 - layer * 0.08;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + layer * 0.2;
            const px = x + Math.cos(angle) * r;
            const py = y + Math.sin(angle) * r;
            ctx.shadowColor = color;
            ctx.shadowBlur = 12;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(px, py, radius * 0.05 * (layer + 1), 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
    ctx.globalAlpha = 1;
    ctx.restore();
}

function drawGlowText(ctx, text, x, y, font, colors, shadowColor, shadowBlur, strokeColor, strokeWidth) {
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = shadowBlur;
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth || 4;
        ctx.strokeText(text, x, y);
    }
    
    if (Array.isArray(colors) && colors.length > 1) {
        const gradient = ctx.createLinearGradient(x - text.length * 25, 0, x + text.length * 25, 0);
        const step = 1 / (colors.length - 1);
        colors.forEach((color, i) => {
            gradient.addColorStop(i * step, color);
        });
        ctx.fillStyle = gradient;
    } else {
        ctx.fillStyle = colors;
    }
    
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;
}

function drawOrnament(ctx, x, y, size, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(0, 0, size, angle - 0.25, angle + 0.25);
        ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.restore();
}

function drawCornerDecoration(ctx, x, y, size, color, thickness) {
    const t = thickness || 5;
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = color;
    ctx.shadowBlur = 30;
    ctx.strokeStyle = color;
    ctx.lineWidth = t;
    ctx.beginPath();
    ctx.moveTo(0, size);
    ctx.lineTo(0, 0);
    ctx.lineTo(size, 0);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
}

function drawBorderPattern(ctx, x, y, w, h, color, spacing, thickness) {
    const step = spacing || 50;
    const t = thickness || 2;
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = color;
    ctx.lineWidth = t;
    ctx.globalAlpha = 0.25;
    for (let i = 0; i < w; i += step) {
        ctx.beginPath();
        ctx.moveTo(x + i, y);
        ctx.lineTo(x + i + step/2, y + 15);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + i, y + h);
        ctx.lineTo(x + i + step/2, y + h - 15);
        ctx.stroke();
    }
    for (let i = 0; i < h; i += step) {
        ctx.beginPath();
        ctx.moveTo(x, y + i);
        ctx.lineTo(x + 15, y + i + step/2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + w, y + i);
        ctx.lineTo(x + w - 15, y + i + step/2);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.restore();
}

function drawGeometricPattern(ctx, x, y, w, h, color) {
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    const step = 80;
    for (let i = 0; i < w; i += step) {
        for (let j = 0; j < h; j += step) {
            ctx.beginPath();
            ctx.moveTo(x + i, y + j);
            ctx.lineTo(x + i + step, y + j + step);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + i + step, y + j);
            ctx.lineTo(x + i, y + j + step);
            ctx.stroke();
        }
    }
    ctx.globalAlpha = 1;
    ctx.restore();
}

function drawVine(ctx, x1, y1, x2, y2, color, width) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.strokeStyle = color;
    ctx.lineWidth = width || 3;
    ctx.globalAlpha = 0.15;
    const steps = 25;
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = x1 + (x2 - x1) * t;
        const y = y1 + (y2 - y1) * t + Math.sin(t * Math.PI * 4) * 20;
        if (i === 0) ctx.beginPath();
        ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.restore();
}

function drawCrown(ctx, x, y, size, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = color;
    ctx.shadowBlur = 30;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.12;
    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.quadraticCurveTo(-size * 0.7, -size * 0.7, -size * 0.4, -size * 0.35);
    ctx.quadraticCurveTo(0, -size, size * 0.4, -size * 0.35);
    ctx.quadraticCurveTo(size * 0.7, -size * 0.7, size, 0);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.restore();
}

async function drawProfileImage(ctx, imageUrl, x, y, size, borderColor, glowColor, shadowSize, innerGlow) {
    const radius = size / 2;
    try {
        const response = await axios.get(imageUrl, {
            responseType: "arraybuffer",
            headers: { "User-Agent": "Mozilla/5.0" }
        });
        const img = await loadImage(Buffer.from(response.data));

        ctx.shadowColor = glowColor || borderColor;
        ctx.shadowBlur = shadowSize || 55;
        ctx.beginPath();
        ctx.arc(x, y, radius + 20, 0, Math.PI * 2);
        ctx.fillStyle = borderColor;
        ctx.fill();
        ctx.shadowBlur = 0;

        const gradient = ctx.createRadialGradient(x - 15, y - 15, 0, x, y, radius + 14);
        gradient.addColorStop(0, borderColor);
        gradient.addColorStop(0.25, glowColor || borderColor);
        gradient.addColorStop(0.5, "#ffffff");
        gradient.addColorStop(0.7, glowColor || borderColor);
        gradient.addColorStop(1, borderColor);
        ctx.beginPath();
        ctx.arc(x, y, radius + 12, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.shadowColor = "rgba(255,255,255,0.7)";
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, x - radius, y - radius, size, size);
        ctx.restore();

        if (innerGlow) {
            const innerGradient = ctx.createRadialGradient(x, y, radius * 0.3, x, y, radius);
            innerGradient.addColorStop(0, "rgba(255,255,255,0)");
            innerGradient.addColorStop(0.7, "rgba(255,255,255,0)");
            innerGradient.addColorStop(1, "rgba(255,255,255,0.2)");
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = innerGradient;
            ctx.fill();
        }

        ctx.shadowColor = glowColor || borderColor;
        ctx.shadowBlur = 20;
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, radius + 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

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

async function createWelcomeCard(gcImg, userImg, adderImg, userName, userNumber, threadName, adderName) {
    const width = 2000;
    const height = 1100;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const selectedBackground = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
    const background = await loadBackgroundImage(selectedBackground);
    
    if (background) {
        ctx.drawImage(background, 0, 0, width, height);
    } else {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#0a0a1a');
        gradient.addColorStop(0.15, '#1a0a2e');
        gradient.addColorStop(0.3, '#0d1b2a');
        gradient.addColorStop(0.5, '#1a0a2e');
        gradient.addColorStop(0.7, '#0d1b2a');
        gradient.addColorStop(0.85, '#1a0a2e');
        gradient.addColorStop(1, '#0a0a1a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    const overlay = ctx.createRadialGradient(width/2, height/2, 200, width/2, height/2, 1100);
    overlay.addColorStop(0, "rgba(0,0,0,0.02)");
    overlay.addColorStop(0.2, "rgba(0,0,0,0.08)");
    overlay.addColorStop(0.4, "rgba(0,0,0,0.2)");
    overlay.addColorStop(0.7, "rgba(0,0,0,0.4)");
    overlay.addColorStop(1, "rgba(0,0,0,0.8)");
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, width, height);

    drawGeometricPattern(ctx, 0, 0, width, height, "rgba(255, 215, 0, 0.3)");

    const goldColors = ["rgba(255, 215, 0, 0.6)", "rgba(255, 215, 0, 0.4)", "rgba(255, 215, 0, 0.2)"];
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 1.5 + Math.random() * 4;
        const color = goldColors[Math.floor(Math.random() * goldColors.length)];
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    for (let i = 0; i < 40; i++) {
        const x = 30 + Math.random() * (width - 60);
        const y = 30 + Math.random() * (height - 60);
        const size = 25 + Math.random() * 50;
        const colors = ["rgba(255, 215, 0, 0.04)", "rgba(255, 107, 107, 0.04)", "rgba(78, 205, 196, 0.04)"];
        drawFlower(ctx, x, y, size, colors[Math.floor(Math.random() * colors.length)], 6 + Math.floor(Math.random() * 6), Math.random() * Math.PI * 2);
    }

    for (let i = 0; i < 35; i++) {
        const x = 60 + Math.random() * (width - 120);
        const y = 60 + Math.random() * (height - 120);
        const size = 12 + Math.random() * 30;
        const colors = ["rgba(255, 215, 0, 0.06)", "rgba(255, 107, 107, 0.06)", "rgba(78, 205, 196, 0.06)"];
        drawStar(ctx, x, y, size, colors[Math.floor(Math.random() * colors.length)], Math.random() * Math.PI * 2, 18, 5 + Math.floor(Math.random() * 3));
    }

    for (let i = 0; i < 50; i++) {
        const x = 50 + Math.random() * (width - 100);
        const y = 50 + Math.random() * (height - 100);
        const size = 6 + Math.random() * 12;
        drawDiamond(ctx, x, y, size, "rgba(255, 215, 0, 0.05)", 15, Math.random() * Math.PI * 2);
    }

    for (let i = 0; i < 25; i++) {
        const x = 100 + Math.random() * (width - 200);
        const y = 100 + Math.random() * (height - 200);
        const radius = 40 + Math.random() * 80;
        drawMandala(ctx, x, y, radius, "rgba(255, 215, 0, 0.04)", 2 + Math.floor(Math.random() * 3));
    }

    for (let i = 0; i < 20; i++) {
        const x = 80 + Math.random() * (width - 160);
        const y = 80 + Math.random() * (height - 160);
        const radius = 50 + Math.random() * 100;
        drawCirclePattern(ctx, x, y, radius, "rgba(255, 215, 0, 0.03)", 8 + Math.floor(Math.random() * 8));
    }

    drawVine(ctx, 100, 100, 450, 350, "rgba(255, 215, 0, 0.1)", 3);
    drawVine(ctx, width - 100, 100, width - 450, 350, "rgba(255, 215, 0, 0.1)", 3);
    drawVine(ctx, 100, height - 100, 450, height - 350, "rgba(255, 215, 0, 0.1)", 3);
    drawVine(ctx, width - 100, height - 100, width - 450, height - 350, "rgba(255, 215, 0, 0.1)", 3);

    drawCrown(ctx, 100, 80, 70, "rgba(255, 215, 0, 0.08)");
    drawCrown(ctx, width - 100, 80, 70, "rgba(255, 215, 0, 0.08)");
    drawCrown(ctx, 100, height - 80, 70, "rgba(255, 215, 0, 0.08)");
    drawCrown(ctx, width - 100, height - 80, 70, "rgba(255, 215, 0, 0.08)");

    ctx.shadowColor = "rgba(255, 215, 0, 0.7)";
    ctx.shadowBlur = 70;
    const mainGradient = ctx.createLinearGradient(0, 0, width, 0);
    mainGradient.addColorStop(0, "rgba(255, 215, 0, 0)");
    mainGradient.addColorStop(0.05, "rgba(255, 215, 0, 0.3)");
    mainGradient.addColorStop(0.15, "rgba(255, 215, 0, 0.6)");
    mainGradient.addColorStop(0.3, "rgba(255, 215, 0, 0.8)");
    mainGradient.addColorStop(0.5, "#ffd700");
    mainGradient.addColorStop(0.7, "rgba(255, 215, 0, 0.8)");
    mainGradient.addColorStop(0.85, "rgba(255, 215, 0, 0.6)");
    mainGradient.addColorStop(0.95, "rgba(255, 215, 0, 0.3)");
    mainGradient.addColorStop(1, "rgba(255, 215, 0, 0)");
    ctx.fillStyle = mainGradient;
    ctx.fillRect(100, 0, width - 200, 12);
    ctx.fillRect(100, height - 12, width - 200, 12);
    ctx.shadowBlur = 0;

    ctx.shadowColor = "rgba(255, 215, 0, 0.5)";
    ctx.shadowBlur = 60;
    ctx.strokeStyle = "rgba(255, 215, 0, 0.5)";
    ctx.lineWidth = 6;
    ctx.strokeRect(60, 60, width - 120, height - 120);
    ctx.shadowBlur = 0;

    ctx.shadowColor = "rgba(255, 215, 0, 0.3)";
    ctx.shadowBlur = 45;
    ctx.strokeStyle = "rgba(255, 215, 0, 0.25)";
    ctx.lineWidth = 3;
    ctx.strokeRect(85, 85, width - 170, height - 170);
    ctx.shadowBlur = 0;

    ctx.shadowColor = "rgba(255, 215, 0, 0.2)";
    ctx.shadowBlur = 35;
    ctx.strokeStyle = "rgba(255, 215, 0, 0.15)";
    ctx.lineWidth = 2;
    ctx.strokeRect(110, 110, width - 220, height - 220);
    ctx.shadowBlur = 0;

    drawCornerDecoration(ctx, 70, 70, 90, "rgba(255, 215, 0, 0.7)", 6);
    drawCornerDecoration(ctx, width - 70, 70, -90, "rgba(255, 215, 0, 0.7)", 6);
    drawCornerDecoration(ctx, 70, height - 70, 90, "rgba(255, 215, 0, 0.7)", 6);
    drawCornerDecoration(ctx, width - 70, height - 70, -90, "rgba(255, 215, 0, 0.7)", 6);

    drawBorderPattern(ctx, 60, 60, width - 120, height - 120, "rgba(255, 215, 0, 0.15)", 50, 2);

    for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2;
        const x = width/2 + Math.cos(angle) * 850;
        const y = height/2 + Math.sin(angle) * 480;
        const size = 10 + Math.sin(i * 1.7) * 5;
        drawDiamond(ctx, x, y, size, "rgba(255, 215, 0, 0.08)", 15, angle);
    }

    for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2 + Math.PI / 16;
        const x = width/2 + Math.cos(angle) * 900;
        const y = height/2 + Math.sin(angle) * 520;
        drawStar(ctx, x, y, 14 + Math.sin(i * 1.4) * 4, "rgba(255, 215, 0, 0.06)", angle, 18, 5);
    }

    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const x = width/2 + Math.cos(angle) * 950;
        const y = height/2 + Math.sin(angle) * 560;
        drawFlower(ctx, x, y, 25 + Math.sin(i * 1.6) * 8, "rgba(255, 215, 0, 0.04)", 8 + Math.floor(Math.random() * 4), angle);
    }

    for (let i = 0; i < 14; i++) {
        const angle = (i / 14) * Math.PI * 2;
        const x = width/2 + Math.cos(angle) * 880;
        const y = height/2 + Math.sin(angle) * 500;
        drawMandala(ctx, x, y, 20 + Math.sin(i * 1.3) * 6, "rgba(255, 215, 0, 0.03)", 2);
    }

    for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const x = width/2 + Math.cos(angle) * 780;
        const y = height/2 + Math.sin(angle) * 440;
        drawCirclePattern(ctx, x, y, 25 + Math.sin(i * 1.5) * 10, "rgba(255, 215, 0, 0.02)", 6 + Math.floor(Math.random() * 4));
    }

    ctx.shadowColor = "rgba(0,0,0,0.7)";
    ctx.shadowBlur = 60;
    ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = "rgba(255, 215, 0, 0.15)";
    ctx.textAlign = "right";
    ctx.fillText("✦ XALMAN II ✦", width - 70, 110);
    ctx.shadowBlur = 0;

    await drawProfileImage(ctx, gcImg, width / 2, 280, 280, "#ffd700", "#ffed4a", 65, true);
    await drawProfileImage(ctx, userImg, 200, height - 180, 230, "#ff6b6b", "#ffd93d", 60, true);
    await drawProfileImage(ctx, adderImg, width - 200, 180, 220, "#4ecdc4", "#44bd9e", 60, true);

    ctx.shadowColor = "rgba(0,0,0,0.7)";
    ctx.shadowBlur = 35;
    ctx.font = 'bold 62px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(threadName, width / 2, 495);
    ctx.shadowBlur = 0;

    drawGlowText(
        ctx,
        "✦ WELCOME ✦",
        width / 2, 655,
        'bold 130px "Segoe UI", Arial, sans-serif',
        ["#ff6b6b", "#ffd700", "#4ecdc4"],
        "rgba(255, 215, 0, 0.6)",
        70,
        "rgba(0,0,0,0.3)",
        5
    );

    ctx.shadowColor = "rgba(255, 215, 0, 0.4)";
    ctx.shadowBlur = 30;
    const underGradient = ctx.createLinearGradient(width/2 - 400, 0, width/2 + 400, 0);
    underGradient.addColorStop(0, "rgba(255, 215, 0, 0)");
    underGradient.addColorStop(0.05, "rgba(255, 215, 0, 0.2)");
    underGradient.addColorStop(0.15, "rgba(255, 215, 0, 0.5)");
    underGradient.addColorStop(0.3, "rgba(255, 215, 0, 0.8)");
    underGradient.addColorStop(0.5, "#ffd700");
    underGradient.addColorStop(0.7, "rgba(255, 215, 0, 0.8)");
    underGradient.addColorStop(0.85, "rgba(255, 215, 0, 0.5)");
    underGradient.addColorStop(0.95, "rgba(255, 215, 0, 0.2)");
    underGradient.addColorStop(1, "rgba(255, 215, 0, 0)");
    ctx.fillStyle = underGradient;
    ctx.fillRect(width/2 - 400, 700, 800, 8);
    ctx.shadowBlur = 0;

    drawGlowText(
        ctx,
        userName.toUpperCase(),
        width / 2, 780,
        'bold 78px "Segoe UI", Arial, sans-serif',
        "#ffffff",
        "rgba(255, 107, 107, 0.5)",
        40,
        "rgba(0,0,0,0.2)",
        4
    );

    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 25;
    ctx.font = 'bold 40px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = "rgba(255, 215, 0, 0.8)";
    ctx.fillText(`✦ Member #${userNumber} ✦`, width / 2, 850);
    ctx.shadowBlur = 0;

    const badgeY = 905;
    ctx.shadowColor = "rgba(255, 215, 0, 0.4)";
    ctx.shadowBlur = 35;
    ctx.fillStyle = "rgba(255, 215, 0, 0.06)";
    ctx.roundRect(width/2 - 320, badgeY - 35, 640, 75, 25);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.shadowColor = "rgba(255, 215, 0, 0.2)";
    ctx.shadowBlur = 20;
    ctx.strokeStyle = "rgba(255, 215, 0, 0.15)";
    ctx.lineWidth = 2;
    ctx.roundRect(width/2 - 320, badgeY - 35, 640, 75, 25);
    ctx.stroke();
    ctx.shadowBlur = 0;

    drawGlowText(
        ctx,
        "✦ LOYALTY  •  RESPECT  •  HONOR  •  STRENGTH  •  UNITY ✦",
        width / 2, badgeY + 10,
        'bold 30px "Segoe UI", Arial, sans-serif',
        ["#ff6b6b", "#ffd700", "#4ecdc4", "#ffd700", "#ff6b6b"],
        "rgba(255, 215, 0, 0.2)",
        18,
        "rgba(0,0,0,0.1)",
        2
    );

    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 20;
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffd93d";
    ctx.font = 'bold 38px "Segoe UI", Arial, sans-serif';
    ctx.fillText(`✦ ${userName}`, 400, height - 185);
    
    ctx.shadowColor = "rgba(255, 217, 61, 0.25)";
    ctx.shadowBlur = 12;
    ctx.fillStyle = "rgba(255, 217, 61, 0.15)";
    ctx.fillRect(400, height - 178, 260, 5);
    ctx.shadowBlur = 0;

    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 20;
    ctx.textAlign = "right";
    ctx.fillStyle = "#4ecdc4";
    ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
    ctx.fillText(`Added by ${adderName} ✦`, width - 400, 190);
    
    ctx.shadowColor = "rgba(78, 205, 196, 0.25)";
    ctx.shadowBlur = 12;
    ctx.fillStyle = "rgba(78, 205, 196, 0.15)";
    ctx.fillRect(width - 660, 198, 260, 5);
    ctx.shadowBlur = 0;

    ctx.shadowColor = "rgba(255, 215, 0, 0.15)";
    ctx.shadowBlur = 25;
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255, 215, 0, 0.06)";
    ctx.font = '18px "Segoe UI", Arial, sans-serif';
    ctx.fillText("✦ XALMAN II ✦", width - 60, height - 50);
    ctx.shadowBlur = 0;

    const smallFlowers = [
        {x: 140, y: 140},
        {x: width - 140, y: 140},
        {x: 140, y: height - 140},
        {x: width - 140, y: height - 140}
    ];
    smallFlowers.forEach(pos => {
        drawFlower(ctx, pos.x, pos.y, 30, "rgba(255, 215, 0, 0.1)", 8, 0);
    });

    for (let i = 0; i < 8; i++) {
        const x = 280 + i * (width - 560) / 7;
        drawOrnament(ctx, x, 100, 25, "rgba(255, 215, 0, 0.08)");
        drawOrnament(ctx, x, height - 100, 25, "rgba(255, 215, 0, 0.08)");
    }

    for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        const x = width/2 + Math.cos(angle) * 920;
        const y = height/2 + Math.sin(angle) * 540;
        drawDiamond(ctx, x, y, 5, "rgba(255, 215, 0, 0.04)", 10, angle);
    }

    ctx.shadowColor = "rgba(255, 215, 0, 0.1)";
    ctx.shadowBlur = 15;
    ctx.strokeStyle = "rgba(255, 215, 0, 0.05)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([12, 18]);
    ctx.beginPath();
    ctx.arc(width/2, height/2, 650, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(width/2, height/2, 780, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    return canvas.toBuffer();
}

module.exports = {
    config: {
        name: "welcome",
        version: "3.0",
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
