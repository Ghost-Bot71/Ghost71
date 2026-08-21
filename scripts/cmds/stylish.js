
const PAGE_SIZE = 10;

function buildStyles(name) {
  const map = (chars) => (s) => s.split("").map(c => {
    const u = c.toUpperCase().charCodeAt(0) - 65;
    const l = c.toLowerCase().charCodeAt(0) - 97;
    if (/[A-Z]/.test(c)) return chars[u] !== undefined ? chars[u] : c;
    if (/[a-z]/.test(c)) return chars[26 + l] !== undefined ? chars[26 + l] : c;
    return c;
  }).join("");

  const gothic   = map([..."𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟"]);
  const cursive  = map([..."𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃"]);
  const double_  = map([..."𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫"]);
  const bubble   = map([..."ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ"]);
  const block_   = map([..."🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉"]);
  const small_   = map([..."ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘQʀꜱᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘQʀꜱᴛᴜᴠᴡxʏᴢ"]);
  const bold_    = map([..."𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇"]);
  const italic_  = map([..."𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻"]);
  const boldItal = map([..."𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯"]);
  const mono_    = map([..."𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣"]);
  const frak_    = map([..."𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷"]);
  const sans_    = map([..."𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇"]);

  const wide_    = (s) => s.split("").map(c => { const code = c.charCodeAt(0); return (code >= 33 && code <= 126) ? String.fromCharCode(code + 65248) : c; }).join("");
  const strike_  = (s) => s.split("").map(c => c + "\u0336").join("");
  const underl_  = (s) => s.split("").map(c => c + "\u0332").join("");
  const overl_   = (s) => s.split("").map(c => c + "\u0305").join("");
  const wavy_    = (s) => s.split("").map(c => c + "\u0330").join("");
  const dotted_  = (s) => s.split("").map(c => c + "\u0323").join("");
  const sparkle_ = (s) => s.split("").join("✨");
  const star_    = (s) => s.split("").join("⭐");
  const fire_    = (s) => `🔥${s.split("").join("🔥")}🔥`;
  const heart_   = (s) => s.split("").join("❤️");
  const dot_     = (s) => s.split("").join("·");
  const diamond_ = (s) => s.split("").join("◆");
  const arrow_   = (s) => s.split("").join("→");
  const wave_    = (s) => s.split("").join("~");

  const frames = [
    (s) => `꧁༺${s}༻꧂`,   (s) => `『${s}』`,   (s) => `★彡${s}彡★`,
    (s) => `•͙✧${s}✧•͙`,  (s) => `⟨⟨${s}⟩⟩`,   (s) => `【${s}】`,
    (s) => `〖${s}〗`,     (s) => `⌈${s}⌋`,    (s) => `⊱❦${s}❦⊰`,
    (s) => `░▒▓${s}▓▒░`, (s) => `∙◦°∘${s}∘°◦∙`, (s) => `꒷꒦꒷${s}꒷꒦꒷`,
    (s) => `✦•̩̩͙*${s}*•̩̩͙✦`, (s) => `🌸${s}🌸`, (s) => `⚡${s}⚡`,
    (s) => `🎯${s}🎯`,    (s) => `💎${s}💎`,   (s) => `🏆${s}🏆`,
    (s) => `⚔️${s}⚔️`,   (s) => `👑${s}👑`,   (s) => `🌟${s}🌟`,
    (s) => `🎭${s}🎭`,   (s) => `🎪${s}🎪`,   (s) => `🎨${s}🎨`,
    (s) => `🔮${s}🔮`,   (s) => `🌈${s}🌈`,   (s) => `💫${s}💫`,
    (s) => `🦋${s}🦋`,   (s) => `🌺${s}🌺`,   (s) => `🎌${s}🎌`,
    (s) => `🔥${s}🔥`,   (s) => `💀${s}💀`,   (s) => `🌙${s}🌙`,
    (s) => `⭐${s}⭐`,   (s) => `🎵${s}🎵`,   (s) => `🎸${s}🎸`,
    (s) => `🏆${s}🏆`,   (s) => `👻${s}👻`,   (s) => `🐉${s}🐉`,
    (s) => `🌊${s}🌊`,   (s) => `🦁${s}🦁`,   (s) => `🐺${s}🐺`,
    (s) => `═[${s}]═`,  (s) => `-=[${s}]=-`, (s) => `>>>${s}<<<`,
    (s) => `•[${s}]•`,  (s) => `||${s}||`,   (s) => `//${s}//`,
    (s) => `:::${s}:::`, (s) => `###${s}###`, (s) => `***${s}***`,
    (s) => `---${s}---`, (s) => `===${s}===`, (s) => `~~~${s}~~~`,
  ];

  const base = [
    gothic, cursive, double_, bubble, block_, small_, bold_, italic_, boldItal, mono_, frak_, wide_,
    strike_, underl_, overl_, wavy_, dotted_, sparkle_, star_, fire_, heart_, dot_, diamond_, arrow_, wave_,
    sans_,
    (s) => gothic(s).split("").join(" "),
    (s) => cursive(s).split("").join(" "),
    (s) => bold_(s).split("").join("·"),
    (s) => wide_(s),
  ];

  const list = [];

  // Base styles (30)
  const labels = ["𝕲𝖔𝖙𝖍𝖎𝖈","𝓒𝓾𝓻𝓼𝓲𝓿𝓮","𝔻𝕠𝕦𝕓𝕝𝕖","Ⓑⓤⓑⓑⓛⓔ","🅱🅻🅾🅲🅺","ꜱᴍᴀʟʟ ᴄᴀᴘꜱ","𝗕𝗼𝗹𝗱","𝘐𝘵𝘢𝘭𝘪𝘤","𝙱𝚘𝚕𝚍 𝙸𝚝𝚊𝚕𝚒𝚌","𝙼𝚘𝚗𝚘𝚜𝚙𝚊𝚌𝚎","𝔉𝔯𝔞𝔨𝔱𝔲𝔯","Ｗｉｄｅ","S̶t̶r̶i̶k̶e̶","U͟n͟d͟e͟r͟l͟i͟n͟e͟","O̅v̅e̅r̅lͅi̅n̅e̅","W͜a͜v͜y͜","Ḍ͟o͟ṭ͟ṭ͟e͟d͟","✨Sparkle✨","⭐Star⭐","🔥Fire🔥","❤️Heart❤️","·D·o·t·","◆Diamond◆","→Arrow→","~Wave~","Sans Bold","Gothic Spaced","Cursive Spaced","Bold Dotted","Wide Full"];
  base.forEach((fn, i) => list.push({ label: labels[i] || `Style ${i+1}`, fn }));

  // Frame combos (50 each base font × frames)
  const fCombos = [
    [gothic, "꧁༺{s}༻꧂ Gothic"], [cursive, "★彡{s}彡★ Cursive"], [double_, "【{s}】 Double"],
    [bold_, "💎{s}💎 Bold"], [small_, "👑{s}👑 SmallCaps"], [cursive, "🌸{s}🌸 Cursive"],
    [wide_, "⚡{s}⚡ Wide"], [frak_, "🔮{s}🔮 Fraktur"], [boldItal, "🏆{s}🏆 BoldItalic"],
    [mono_, "🌈{s}🌈 Mono"], [gothic, "『{s}』 Gothic"], [cursive, "⊱❦{s}❦⊰ Cursive"],
    [double_, "░▒▓{s}▓▒░ Double"], [bold_, "👻{s}👻 Bold"], [italic_, "🎌{s}🎌 Italic"],
    [small_, "🦋{s}🦋 Small"], [mono_, "🔥{s}🔥 Mono"], [frak_, "⭐{s}⭐ Frak"],
    [boldItal, "🌊{s}🌊 BoldIt"], [gothic, "🐉{s}🐉 Gothic"],
    [cursive, "🎵{s}🎵 Cursive"], [double_, "🎭{s}🎭 Double"], [bold_, "🎪{s}🎪 Bold"],
    [italic_, "💀{s}💀 Italic"], [small_, "🌙{s}🌙 Small"], [mono_, "🎯{s}🎯 Mono"],
    [frak_, "🦁{s}🦁 Frak"], [boldItal, "🐺{s}🐺 BoldIt"], [gothic, "===${s}=== Gothic"], [cursive, ">>>{s}<<< Cursive"],
    [double_, ":::{s}::: Double"], [bold_, "---{s}--- Bold"], [italic_, "***{s}*** Italic"],
    [small_, "||{s}|| Small"], [mono_, "//${s}// Mono"], [frak_, "•[{s}]• Frak"],
    [boldItal, "-=[{s}]=- BoldIt"], [gothic, "═[{s}]═ Gothic"], [cursive, "꒷꒦꒷{s}꒷꒦꒷ Cursive"],
    [double_, "∙◦°∘{s}∘°◦∙ Double"], [bold_, "✦•̩̩͙*{s}*•̩̩͙✦ Bold"], [italic_, "🎨{s}🎨 Italic"],
    [small_, "🎸{s}🎸 Small"], [mono_, "•͙✧{s}✧•͙ Mono"], [frak_, "〖{s}〗 Frak"],
    [boldItal, "⌈{s}⌋ BoldIt"], [gothic, "⟨⟨{s}⟩⟩ Gothic"], [cursive, "💫{s}💫 Cursive"],
    [double_, "🌺{s}🌺 Double"],
  ];
  fCombos.forEach(([fn, labelTpl]) => {
    list.push({ label: labelTpl.replace("{s}",""), fn: (s) => labelTpl.split("{s}")[0] + fn(s) + labelTpl.split("{s}")[1] });
  });

  // Special transforms (30)
  const extras = [
    { label: "CAPS Gothic",      fn: (s) => gothic(s.toUpperCase()) },
    { label: "lower cursive",    fn: (s) => cursive(s.toLowerCase()) },
    { label: "CAPS Bold",        fn: (s) => bold_(s.toUpperCase()) },
    { label: "Reverse Gothic",   fn: (s) => gothic(s.split("").reverse().join("")) },
    { label: "Bold Strike",      fn: (s) => strike_(bold_(s)) },
    { label: "Cursive Underline",fn: (s) => underl_(cursive(s)) },
    { label: "Gothic Overline",  fn: (s) => overl_(gothic(s)) },
    { label: "Wide Strike",      fn: (s) => strike_(wide_(s)) },
    { label: "Mono Underline",   fn: (s) => underl_(mono_(s)) },
    { label: "Double Wavy",      fn: (s) => wavy_(double_(s)) },
    { label: "Bubble Dotted",    fn: (s) => dotted_(bubble(s)) },
    { label: "Small Sparkle",    fn: (s) => sparkle_(small_(s)) },
    { label: "Bold Star",        fn: (s) => star_(bold_(s)) },
    { label: "Frak Fire",        fn: (s) => fire_(frak_(s)) },
    { label: "Italic Heart",     fn: (s) => heart_(italic_(s)) },
    { label: "Gothic Diamond",   fn: (s) => diamond_(gothic(s)) },
    { label: "Cursive Arrow",    fn: (s) => arrow_(cursive(s)) },
    { label: "Mono Wave",        fn: (s) => wave_(mono_(s)) },
    { label: "Bold Dot",         fn: (s) => dot_(bold_(s)) },
    { label: "CAPS Wide",        fn: (s) => wide_(s.toUpperCase()) },
    { label: "Gothic Heart",     fn: (s) => heart_(gothic(s)) },
    { label: "Double Star",      fn: (s) => star_(double_(s)) },
    { label: "Cursive Fire",     fn: (s) => fire_(cursive(s)) },
    { label: "Small Underline",  fn: (s) => underl_(small_(s)) },
    { label: "Bold Wavy",        fn: (s) => wavy_(bold_(s)) },
    { label: "Frak Overline",    fn: (s) => overl_(frak_(s)) },
    { label: "BoldItal Dotted",  fn: (s) => dotted_(boldItal(s)) },
    { label: "Gothic Sparkle",   fn: (s) => sparkle_(gothic(s)) },
    { label: "Wide Diamond",     fn: (s) => diamond_(wide_(s)) },
    { label: "Mono Arrow",       fn: (s) => arrow_(mono_(s)) },
    { label: "Bubble Arrow",     fn: (s) => arrow_(bubble(s)) },
    { label: "Block Star",       fn: (s) => star_(block_(s)) },
    { label: "Double Heart",     fn: (s) => heart_(double_(s)) },
    { label: "Cursive Wavy",     fn: (s) => wavy_(cursive(s)) },
    { label: "Gothic Wave",      fn: (s) => wave_(gothic(s)) },
    { label: "Italic Sparkle",   fn: (s) => sparkle_(italic_(s)) },
    { label: "Frak Dot",         fn: (s) => dot_(frak_(s)) },
    { label: "BoldItal Fire",    fn: (s) => fire_(boldItal(s)) },
    { label: "Wide Heart",       fn: (s) => heart_(wide_(s)) },
    { label: "Mono Sparkle",     fn: (s) => sparkle_(mono_(s)) },
    { label: "Small Diamond",    fn: (s) => diamond_(small_(s)) },
    { label: "Bubble Fire",      fn: (s) => fire_(bubble(s)) },
    { label: "Frak Wave",        fn: (s) => wave_(frak_(s)) },
    { label: "Gothic Arrow",     fn: (s) => arrow_(gothic(s)) },
    { label: "Italic Dot",       fn: (s) => dot_(italic_(s)) },
    { label: "BoldItal Star",    fn: (s) => star_(boldItal(s)) },
    { label: "Cursive Diamond",  fn: (s) => diamond_(cursive(s)) },
    { label: "Wide Wave",        fn: (s) => wave_(wide_(s)) },
    { label: "Double Arrow",     fn: (s) => arrow_(double_(s)) },
    { label: "Gothic Dot",       fn: (s) => dot_(gothic(s)) },
  ];
  extras.forEach(e => list.push(e));

  // Frame + special variants to reach 200+
  const moreFrames = frames.slice(0, 20);
  const moreBases = [gothic, cursive, bold_, italic_, double_, mono_, small_, frak_, boldItal, wide_];
  moreFrames.forEach((f, fi) => {
    moreBases.forEach((b, bi) => {
      if (list.length < 215) {
        list.push({ label: `Frame${fi+1}+${labels[bi]||"Style"}`, fn: (s) => f(b(s)) });
      }
    });
  });

  return list.map(({ label, fn }, i) => ({ num: i + 1, label, result: fn(name) }));
}

module.exports = {
  config: {
    name: "stylish",
    version: "4.0",
    author: "Rakib Islam",
    aliases: ["nickname", "ffname", "stylename", "namestyle", "ns", "font"],
    countDown: 5, role: 0,
    shortDescription: "200+ Stylish name designs with pagination 🎮",
    longDescription: "200+ unique stylish name designs. Reply page number to navigate.",
    category: "fun",
    guide: { en: "{pn} <name> — Generate 200+ styles\nReply page number to see next page" }
  },

  onStart: async function ({ message, args, event }) {
    if (!args[0]) return message.reply("📝 নাম দিন!\nExample: .stylish Rakib Islam");
    const name = args.join(" ");
    const styles = buildStyles(name);
    const totalPages = Math.ceil(styles.length / PAGE_SIZE);

    const buildPage = (page) => {
      const start = (page - 1) * PAGE_SIZE;
      const items = styles.slice(start, start + PAGE_SIZE);
      let text = `🎮 𝗦𝗧𝗬𝗟𝗜𝗦𝗛 𝗡𝗔𝗠𝗘𝗦 — "${name}"\n`;
      text += `📖 Page ${page}/${totalPages} | Total: ${styles.length} designs\n`;
      text += `━━━━━━━━━━━━━━━━━━━━\n`;
      for (const { num, label, result } of items) {
        text += `\n${String(num).padStart(3,"0")}▸ [${label}]\n    ${result}\n`;
      }
      text += `━━━━━━━━━━━━━━━━━━━━\n`;
      if (page < totalPages) text += `💬 Reply "${page+1}" for page ${page+1}/${totalPages}`;
      else text += `✅ Done! .stylish [name] to restart. By Rakib Islam`;
      return text;
    };

    message.reply(buildPage(1), (err, info) => {
      if (!info) return;
      global.GoatBot.onReply.set(info.messageID, {
        commandName: "stylish", type: "paginate",
        messageID: info.messageID, currentPage: 1, totalPages,
        name, author: event.senderID
      });
    });
  },

  onReply: async function ({ message, event, Reply }) {
    if (!Reply || Reply.type !== "paginate") return;
    const page = parseInt(event.body?.trim());
    if (isNaN(page) || page < 1 || page > Reply.totalPages)
      return message.reply(`❌ 1-${Reply.totalPages} এর মধ্যে দিন।`);
    const styles = buildStyles(Reply.name);
    const totalPages = Reply.totalPages;
    const buildPage = (pg) => {
      const start = (pg - 1) * PAGE_SIZE;
      const items = styles.slice(start, start + PAGE_SIZE);
      let text = `🎮 𝗦𝗧𝗬𝗟𝗜𝗦𝗛 𝗡𝗔𝗠𝗘𝗦 — "${Reply.name}"\n`;
      text += `📖 Page ${pg}/${totalPages} | Total: ${styles.length} designs\n`;
      text += `━━━━━━━━━━━━━━━━━━━━\n`;
      for (const { num, label, result } of items) {
        text += `\n${String(num).padStart(3,"0")}▸ [${label}]\n    ${result}\n`;
      }
      text += `━━━━━━━━━━━━━━━━━━━━\n`;
      if (pg < totalPages) text += `💬 Reply "${pg+1}" for page ${pg+1}/${totalPages}`;
      else text += `✅ Done! By Rakib Islam`;
      return text;
    };
    message.reply(buildPage(page), (err, info) => {
      if (!info) return;
      global.GoatBot.onReply.set(info.messageID, {
        commandName: "stylish", type: "paginate",
        messageID: info.messageID, currentPage: page,
        totalPages, name: Reply.name, author: Reply.author
      });
    });
  }
};
