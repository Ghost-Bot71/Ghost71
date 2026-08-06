const os = require('os');
const { createCanvas } = require('canvas');
const GIFEncoder = require('gifencoder');
const fs = require('fs-extra');
const path = require('path');

let si = null;
try {
  si = require('systeminformation');
} catch (e) {
  si = null;
}

const C = {
  bg: '#080b12',
  panel: '#0e1420',
  panel2: '#101828',
  line: 'rgba(255,255,255,0.07)',
  lineSoft: 'rgba(255,255,255,0.04)',
  text: '#e9edf6',
  dim: '#6b7690',
  dim2: '#4a5468',
  teal: '#2ee6b8',
  purple: '#8a6bff',
  green: '#2ee6b8',
  red: '#ff5c7a',
  amber: '#ffc857',
};

const statsPath = path.join(__dirname, 'cache', 'command_stats.json');

function readCommandStats() {
  try {
    return fs.readJsonSync(statsPath);
  } catch (e) {
    return {};
  }
}

function writeCommandStats(data) {
  try {
    fs.ensureDirSync(path.dirname(statsPath));
    fs.writeJsonSync(statsPath, data);
  } catch (e) {}
}

module.exports = {
  config: {
    name: "uptime3",
    version: "2.0",
    author: "xalman",
    countDown: 15,
    role: 0,
    description: "Animated GIF server dashboard, FX-dashboard styled",
    category: "system"
  },

  onChat: async function ({ event }) {
    const body = (event.body || '').trim();
    if (!body) return;
    const match = body.match(/^[^a-zA-Z0-9]*([a-zA-Z0-9_]+)/);
    if (!match) return;
    const cmd = match[1].toLowerCase();
    const data = readCommandStats();
    data[cmd] = (data[cmd] || 0) + 1;
    writeCommandStats(data);
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, timestamp } = event;

    try {
      const cachePath = path.join(__dirname, 'cache', `uptime3_${Date.now()}.gif`);
      fs.ensureDirSync(path.join(__dirname, 'cache'));

      const buffer = await generateGIF({ timestamp });
      fs.writeFileSync(cachePath, buffer);

      return api.sendMessage(
        { attachment: fs.createReadStream(cachePath) },
        threadID,
        () => fs.unlinkSync(cachePath),
        messageID
      );
    } catch (e) {
      api.sendMessage(`Error: ${e.message}`, threadID);
    }
  }
};

async function generateGIF({ timestamp }) {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const ramPct = (usedMem / totalMem) * 100;
  const cpuTarget = Math.min(100, (os.loadavg()[0] / os.cpus().length) * 100);
  const ping = Date.now() - timestamp;

  let storage = [];
  let processes = [];

  if (si) {
    const [fsSize, procs] = await Promise.all([
      si.fsSize().catch(() => []),
      si.processes().catch(() => null),
    ]);
    storage = fsSize.slice(0, 3).map(d => ({ name: d.mount, used: d.used, size: d.size, pct: d.use }));
    if (procs && procs.list) {
      processes = procs.list.sort((a, b) => b.cpu - a.cpu).slice(0, 4)
        .map(p => ({ name: p.name, cpu: p.cpu }));
    }
  }

  const rawStats = readCommandStats();
  const topCommands = Object.entries(rawStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, count]) => ({ name, count }));
  const maxCount = topCommands.length ? topCommands[0].count : 1;

  const s = {
    botUptime: fmtUptime(process.uptime()),
    ping: `${ping} ms`,
    ramUsed: fmtBytes(usedMem),
    ramTotal: fmtBytes(totalMem),
    ramPct,
    platform: `${os.platform()} (${os.arch()})`,
    nodeVersion: process.version,
    hostname: os.hostname(),
    storage,
    processes,
    topCommands,
    maxCount,
  };

  const W = 1700, H = 1320;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  const encoder = new GIFEncoder(W, H);
  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(110);
  encoder.setQuality(8);

  const TOTAL_FRAMES = 26;
  const SWEEP_FRAMES = 10;

  let cpuHistory = [];
  let ramHistory = [];
  for (let i = 0; i < 40; i++) {
    cpuHistory.push(Math.max(2, cpuTarget + (Math.random() * 14 - 7)));
    ramHistory.push(Math.max(2, ramPct + (Math.random() * 10 - 5)));
  }

  for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
    const sweepT = Math.min(1, frame / SWEEP_FRAMES);
    const eased = 1 - Math.pow(1 - sweepT, 3);
    const healthTarget = Math.max(0, Math.min(100, 100 - (cpuTarget * 0.5 + ramPct * 0.5)));
    const cpuNow = frame < SWEEP_FRAMES ? cpuTarget * eased : cpuTarget + (Math.random() * 3 - 1.5);
    const ramNow = frame < SWEEP_FRAMES ? ramPct * eased : ramPct + (Math.random() * 2 - 1);
    const healthNow = frame < SWEEP_FRAMES ? healthTarget * eased : healthTarget + (Math.random() * 3 - 1.5);

    cpuHistory.shift();
    cpuHistory.push(Math.max(2, cpuTarget + (Math.random() * 14 - 7)));
    ramHistory.shift();
    ramHistory.push(Math.max(2, ramPct + (Math.random() * 10 - 5)));

    const blink = frame % 6 < 3;

    drawFrame(ctx, W, H, { ...s, cpuNow, ramNow, healthNow, healthTarget, cpuHistory, ramHistory, blink });
    encoder.addFrame(ctx);
  }

  encoder.finish();
  return encoder.out.getData();
}

function drawFrame(ctx, W, H, s) {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  const SBW = 130;
  drawSidebar(ctx, SBW, H, s.blink);

  const cx0 = 170;
  ctx.fillStyle = C.text;
  ctx.font = '800 32px Sans';
  ctx.textAlign = 'left';
  ctx.fillText('SERVER DASHBOARD', cx0, 68);

  drawTopStats(ctx, W, s);

  const leftColX = 170, leftColW = 980, topY = 140;
  const chartH = 560;
  drawChartPanel(ctx, leftColX, topY, leftColW, chartH, s);

  const bottomY = topY + chartH + 25, bottomH = 380;
  const colGap = 25, colW = (leftColW - colGap) / 2;
  drawTopCommandsPanel(ctx, leftColX, bottomY, colW, bottomH, s);
  drawStoragePanel(ctx, leftColX + colW + colGap, bottomY, colW, bottomH, s);

  const rightX = 1170, rightW = 490;
  const rightH = chartH + 25 + bottomH;
  drawHealthPanel(ctx, rightX, topY, rightW, 300, s);
  drawProcessPanel(ctx, rightX, topY + 300 + 20, rightW, 300, s);
  drawTicketPanel(ctx, rightX, topY + 300 + 20 + 300 + 20, rightW, rightH - 300 - 20 - 300 - 20, s);

  const footY = topY + rightH + 25, footW = (rightX + rightW) - leftColX;
  drawFooterStrip(ctx, leftColX, footY, footW, 140, s);
}

function drawSidebar(ctx, w, H, blink) {
  ctx.fillStyle = C.panel;
  ctx.fillRect(0, 0, w, H);
  ctx.strokeStyle = C.line;
  ctx.beginPath();
  ctx.moveTo(w, 0);
  ctx.lineTo(w, H);
  ctx.stroke();

  const grad = ctx.createLinearGradient(20, 20, 78, 78);
  grad.addColorStop(0, C.teal);
  grad.addColorStop(1, C.purple);
  roundRect(ctx, 26, 26, 52, 52, 15);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = C.text;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(38, 56);
  ctx.lineTo(50, 44);
  ctx.lineTo(58, 52);
  ctx.lineTo(70, 36);
  ctx.stroke();

  const icons = [true, false, false, false, false];
  let iy = 130;
  icons.forEach((active) => {
    if (active) {
      roundRect(ctx, 25, iy, 54, 54, 14);
      ctx.fillStyle = 'rgba(138,107,255,0.16)';
      ctx.fill();
      ctx.strokeStyle = C.purple;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.strokeStyle = active ? C.purple : C.dim2;
    ctx.lineWidth = 2.4;
    roundRect(ctx, 38, iy + 13, 28, 28, 6);
    ctx.stroke();
    iy += 82;
  });

  ctx.fillStyle = blink ? C.green : '#0d3a2c';
  ctx.beginPath();
  ctx.arc(65, H - 40, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawTopStats(ctx, W, s) {
  const now = new Date();
  const items = [
    ['BOT UPTIME', s.botUptime],
    ['PING', s.ping],
    ['CPU LOAD', s.cpuNow.toFixed(1) + '%'],
    ['TIME', now.toLocaleTimeString('en-GB') + ' UTC'],
  ];
  let x = W - 50;
  for (let i = items.length - 1; i >= 0; i--) {
    ctx.textAlign = 'right';
    ctx.font = '600 13px Sans';
    ctx.fillStyle = C.dim;
    ctx.fillText(items[i][0], x, 40);
    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = C.text;
    ctx.fillText(items[i][1], x, 68);
    x -= 250;
  }
  ctx.textAlign = 'left';
}

function drawChartPanel(ctx, x, y, w, h, s) {
  drawPanel(ctx, x, y, w, h, 18);
  const pad = 26;

  ctx.fillStyle = C.text;
  ctx.font = 'bold 24px Sans';
  ctx.fillText('CPU LOAD', x + pad, y + 46);

  ctx.fillStyle = C.teal;
  ctx.font = 'bold 24px monospace';
  ctx.fillText(s.cpuNow.toFixed(2) + '%', x + pad + 190, y + 46);

  const tabs = ['5S', '30S', '1M', '5M', '1H'];
  let tx = x + w - pad - tabs.length * 66;
  tabs.forEach((t, i) => {
    if (i === 0) {
      roundRect(ctx, tx, y + 24, 56, 30, 8);
      ctx.fillStyle = 'rgba(138,107,255,0.18)';
      ctx.fill();
    }
    ctx.fillStyle = i === 0 ? C.purple : C.dim;
    ctx.font = '600 13px Sans';
    ctx.textAlign = 'center';
    ctx.fillText(t, tx + 28, y + 44);
    tx += 66;
  });
  ctx.textAlign = 'left';

  const chartX = x + pad, chartY = y + 80, chartW = w - pad * 2, chartH = h - 190;
  drawAreaChart(ctx, chartX, chartY, chartW, chartH, s.cpuHistory, C.teal);
  drawMALine(ctx, chartX, chartY, chartW, chartH, s.cpuHistory, C.purple);

  const volY = chartY + chartH + 14, volH = 46;
  const step = chartW / (s.ramHistory.length - 1);
  const maxV = Math.max(...s.ramHistory, 1);
  s.ramHistory.forEach((v, i) => {
    const bx = chartX + i * step;
    const bh = (v / maxV) * volH;
    ctx.fillStyle = 'rgba(74,144,255,0.35)';
    ctx.fillRect(bx, volY + volH - bh, step * 0.7, bh);
  });

  ctx.fillStyle = C.dim2;
  ctx.font = '11px monospace';
  const labels = ['-40s', '-30s', '-20s', '-10s', '0s'];
  const lw = chartW / (labels.length - 1);
  labels.forEach((l, i) => ctx.fillText(l, chartX + i * lw - 10, y + h - 14));
}

function drawAreaChart(ctx, x, y, w, h, data, color) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = (max - min) || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => [x + i * step, y + h - ((v - min) / range) * h]);

  ctx.beginPath();
  pts.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, y, 0, y + h);
  grad.addColorStop(0, color + '4d');
  grad.addColorStop(1, color + '00');
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  pts.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.4;
  ctx.stroke();

  const [lx, ly] = pts[pts.length - 1];
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(lx, ly, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawMALine(ctx, x, y, w, h, data, color) {
  const period = 6;
  const ma = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) continue;
    let sum = 0;
    for (let k = 0; k < period; k++) sum += data[i - k];
    ma.push(sum / period);
  }
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = (max - min) || 1;
  const step = w / (data.length - 1);
  const offset = (period - 1) * step;

  ctx.beginPath();
  ma.forEach((v, i) => {
    const px = x + offset + i * step;
    const py = y + h - ((v - min) / range) * h;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawHealthPanel(ctx, x, y, w, h, s) {
  drawPanel(ctx, x, y, w, h, 18);
  ctx.fillStyle = C.dim;
  ctx.font = '700 13px Sans';
  ctx.fillText('SYSTEM HEALTH', x + 24, y + 34);

  const cx = x + w / 2, cy = y + 150, r = 90;
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, 2 * Math.PI);
  ctx.strokeStyle = C.panel2;
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.stroke();

  const grad = ctx.createLinearGradient(x, y, x + w, y);
  grad.addColorStop(0, C.teal);
  grad.addColorStop(1, C.purple);
  const frac = Math.max(0, Math.min(100, s.healthNow)) / 100;
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, Math.PI + Math.PI * frac);
  ctx.strokeStyle = grad;
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.stroke();

  const angle = Math.PI + Math.PI * frac;
  ctx.fillStyle = C.purple;
  ctx.beginPath();
  ctx.arc(cx + r * Math.cos(angle), cy + r * Math.sin(angle), 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.fillStyle = C.teal;
  ctx.font = '800 34px Sans';
  ctx.fillText(Math.max(0, s.healthNow).toFixed(0) + '%', cx, cy - 8);
  const label = s.healthTarget >= 70 ? 'OPTIMAL' : s.healthTarget >= 40 ? 'MODERATE' : 'CRITICAL';
  ctx.fillStyle = C.dim;
  ctx.font = '700 13px Sans';
  ctx.fillText(label, cx, cy + 16);
  ctx.textAlign = 'left';

  const sparkY = cy + 40, sparkH = 34;
  drawSparkline(ctx, x + 24, sparkY, w - 48, sparkH, s.cpuHistory, C.teal);

  const rowY = sparkY + sparkH + 30;
  ctx.font = '11px Sans';
  ctx.fillStyle = C.dim;
  ctx.fillText('CPU', x + 24, rowY);
  ctx.textAlign = 'right';
  ctx.fillText('RAM', x + w - 24, rowY);
  ctx.textAlign = 'left';
  ctx.font = 'bold 15px monospace';
  ctx.fillStyle = C.teal;
  ctx.fillText(s.cpuNow.toFixed(0) + '%', x + 24, rowY + 22);
  ctx.fillStyle = C.purple;
  ctx.textAlign = 'right';
  ctx.fillText(s.ramNow.toFixed(0) + '%', x + w - 24, rowY + 22);
  ctx.textAlign = 'left';

  const barY = rowY + 34, barW = w - 48;
  const cpuFrac = s.cpuNow / (s.cpuNow + s.ramNow || 1);
  roundRect(ctx, x + 24, barY, barW * cpuFrac, 7, 4);
  ctx.fillStyle = C.teal;
  ctx.fill();
  roundRect(ctx, x + 24 + barW * cpuFrac, barY, barW * (1 - cpuFrac), 7, 4);
  ctx.fillStyle = C.purple;
  ctx.fill();
}

function drawProcessPanel(ctx, x, y, w, h, s) {
  drawPanel(ctx, x, y, w, h, 18);
  ctx.fillStyle = C.dim;
  ctx.font = '700 13px Sans';
  ctx.fillText('TOP PROCESSES', x + 24, y + 34);

  const data = s.processes.length ? s.processes : [{ name: 'node', cpu: 0 }];
  let ry = y + 66;
  data.forEach((p) => {
    ctx.fillStyle = C.dim;
    ctx.font = '15px Sans';
    ctx.fillText(p.name, x + 24, ry);
    const tag = p.cpu > 20 ? ['HIGH', C.red] : p.cpu > 5 ? ['MEDIUM', C.amber] : ['LOW', C.dim];
    ctx.font = '700 10px Sans';
    ctx.fillStyle = tag[1];
    ctx.textAlign = 'right';
    ctx.fillText(tag[0], x + w - 24, ry);
    ctx.textAlign = 'left';
    ctx.font = '13px monospace';
    ctx.fillStyle = C.text;
    ctx.fillText(p.cpu.toFixed(1) + '%', x + w - 110, ry);
    ry += 54;
    ctx.strokeStyle = C.lineSoft;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x + 24, ry - 30);
    ctx.lineTo(x + w - 24, ry - 30);
    ctx.stroke();
    ctx.setLineDash([]);
  });
}

function drawTicketPanel(ctx, x, y, w, h, s) {
  drawPanel(ctx, x, y, w, h, 18);
  ctx.fillStyle = C.dim;
  ctx.font = '700 13px Sans';
  ctx.fillText('SYSTEM INFO', x + 24, y + 34);

  roundRect(ctx, x + 24, y + 48, w - 48, 40, 10);
  ctx.fillStyle = C.panel2;
  ctx.fill();
  ctx.strokeStyle = C.line;
  ctx.stroke();
  ctx.fillStyle = C.text;
  ctx.font = '700 15px Sans';
  ctx.fillText(s.hostname, x + 40, y + 74);

  const boxY = y + 104, boxW = (w - 24 * 2 - 16) / 2;
  roundRect(ctx, x + 24, boxY, boxW, 60, 10);
  ctx.fillStyle = 'rgba(255,92,122,0.1)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,92,122,0.3)';
  ctx.stroke();
  ctx.fillStyle = C.dim;
  ctx.font = '10px Sans';
  ctx.fillText('USED', x + 38, boxY + 22);
  ctx.fillStyle = C.red;
  ctx.font = 'bold 16px monospace';
  ctx.fillText(s.ramUsed, x + 38, boxY + 46);

  const box2X = x + 24 + boxW + 16;
  roundRect(ctx, box2X, boxY, boxW, 60, 10);
  ctx.fillStyle = 'rgba(46,230,184,0.1)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(46,230,184,0.3)';
  ctx.stroke();
  ctx.fillStyle = C.dim;
  ctx.font = '10px Sans';
  ctx.fillText('TOTAL', box2X + 14, boxY + 22);
  ctx.fillStyle = C.teal;
  ctx.font = 'bold 16px monospace';
  ctx.fillText(s.ramTotal, box2X + 14, boxY + 46);

  ctx.fillStyle = C.dim;
  ctx.font = '12px monospace';
  ctx.fillText(`Node ${s.nodeVersion}  •  ${s.platform}`, x + 24, boxY + 92);

  const btnY = boxY + 112;
  roundRect(ctx, x + 24, btnY, w - 48, 44, 12);
  const grad = ctx.createLinearGradient(x, btnY, x + w, btnY);
  grad.addColorStop(0, C.teal);
  grad.addColorStop(1, C.purple);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.fillStyle = '#060a10';
  ctx.font = '800 14px Sans';
  ctx.textAlign = 'center';
  ctx.fillText('🔄 REFRESH DASHBOARD', x + w / 2, btnY + 28);
  ctx.textAlign = 'left';
}

function drawTopCommandsPanel(ctx, x, y, w, h, s) {
  drawPanel(ctx, x, y, w, h, 18);
  ctx.fillStyle = C.dim;
  ctx.font = '700 13px Sans';
  ctx.fillText('TOP COMMANDS', x + 22, y + 32);

  const data = s.topCommands.length ? s.topCommands : [{ name: 'N/A', count: 0 }];
  let ry = y + 62;
  const barX = x + 90, barW = w - 90 - 70;
  data.forEach((c) => {
    ctx.fillStyle = C.dim;
    ctx.font = '12px Sans';
    ctx.fillText(c.name.slice(0, 8), x + 22, ry + 4);
    roundRect(ctx, barX, ry - 9, barW, 12, 6);
    ctx.fillStyle = C.panel2;
    ctx.fill();
    const fw = Math.max(6, (c.count / s.maxCount) * barW);
    roundRect(ctx, barX, ry - 9, fw, 12, 6);
    const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    grad.addColorStop(0, C.teal);
    grad.addColorStop(1, C.purple);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.fillStyle = C.text;
    ctx.font = '11px monospace';
    ctx.fillText(String(c.count), barX + barW + 10, ry + 4);
    ry += 40;
  });
}

function drawStoragePanel(ctx, x, y, w, h, s) {
  drawPanel(ctx, x, y, w, h, 18);
  ctx.fillStyle = C.dim;
  ctx.font = '700 13px Sans';
  ctx.fillText('STORAGE', x + 22, y + 32);

  const cols = ['MOUNT', 'USED', 'TOTAL', 'FREE'];
  const colX = [x + 22, x + 150, x + 260, x + 370];
  ctx.font = '10px monospace';
  ctx.fillStyle = C.dim2;
  cols.forEach((c, i) => ctx.fillText(c, colX[i], y + 58));

  const data = s.storage.length ? s.storage : [{ name: '/', used: 0, size: 1, pct: 0 }];
  let ry = y + 90;
  data.forEach((d) => {
    const free = 100 - d.pct;
    ctx.font = '12px monospace';
    ctx.fillStyle = C.text;
    ctx.fillText(d.name, colX[0], ry);
    ctx.fillText(fmtBytes(d.used), colX[1], ry);
    ctx.fillText(fmtBytes(d.size), colX[2], ry);
    const fcolor = free > 40 ? C.teal : free > 15 ? C.amber : C.red;
    roundRect(ctx, colX[3], ry - 16, 60, 22, 6);
    ctx.fillStyle = fcolor + '22';
    ctx.fill();
    ctx.fillStyle = fcolor;
    ctx.font = '700 12px monospace';
    ctx.fillText(free.toFixed(0) + '%', colX[3] + 8, ry);
    ry += 48;
  });
}

function drawFooterStrip(ctx, x, y, w, h, s) {
  const cards = [
    ['BOT UPTIME', s.botUptime],
    ['PING', s.ping],
    ['CPU LOAD', s.cpuNow.toFixed(1) + '%'],
    ['RAM', s.ramNow.toFixed(0) + '%'],
    ['NODE.JS', s.nodeVersion],
    ['HOSTNAME', s.hostname.slice(0, 12)],
  ];
  const gap = 14, cardW = (w - gap * (cards.length - 1)) / cards.length;
  cards.forEach((c, i) => {
    const cx = x + i * (cardW + gap);
    drawPanel(ctx, cx, y, cardW, h, 14);
    ctx.fillStyle = C.dim;
    ctx.font = '10px Sans';
    ctx.fillText(c[0], cx + 16, y + 30);
    ctx.fillStyle = C.text;
    ctx.font = 'bold 15px monospace';
    ctx.fillText(String(c[1]), cx + 16, y + 60);
    ctx.fillStyle = i === 0 && s.blink ? C.green : (i === 0 ? '#0d3a2c' : 'transparent');
    if (i === 0) {
      ctx.beginPath();
      ctx.arc(cx + cardW - 18, y + 20, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawPanel(ctx, x, y, w, h, r = 16) {
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = C.panel;
  ctx.fill();
  ctx.lineWidth = 1.3;
  ctx.strokeStyle = C.line;
  ctx.stroke();
}

function drawSparkline(ctx, x, y, w, h, data, color) {
  if (!data || data.length < 2) return;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = (max - min) || 1;
  const step = w / (data.length - 1);
  ctx.beginPath();
  data.forEach((v, i) => {
    const px = x + i * step;
    const py = y + h - ((v - min) / range) * h;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function fmtBytes(bytes) {
  return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
}

function fmtUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const sec = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${sec}s`;
}
