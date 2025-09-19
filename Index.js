const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  fetchLatestBaileysVersion,
  Browsers
  } = require('@whiskeysockets/baileys')
  
  const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions')
  const fs = require('fs')
  const P = require('pino')
  const config = require('./config')
  const qrcode = require('qrcode-terminal')
  const util = require('util')
  const { sms,downloadMediaMessage } = require('./lib/msg')
  const axios = require('axios')
  const { File } = require('megajs')
  const prefix = '.'
  
  const ownerNumber = ['22899540505']
  
  //===================SESSION-AUTH============================
  if (!fs.existsSync(__dirname + '/auth_info_baileys/creds.json')) {
  if(!config.SESSION_ID) return console.log('Please add your session to SESSION_ID env !!')
  const sessdata = config.SESSION_ID.split("ARSL~")[1];
  const filer = File.fromURL(`https://mega.nz/file/${sessdata}`)
  filer.download((err, data) => {
  if(err) throw err
  fs.writeFile(__dirname + '/auth_info_baileys/creds.json', data, () => {
  console.log("Session downloaded âœ…")
  })})}
  
  const express = require("express");
  const app = express();
  const port = process.env.PORT || 8000;
  
  //=============================================
  
  async function connectToWA() {
  console.log("Connecting wa bot ðŸ§¬...");
  const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys/')
  var { version } = await fetchLatestBaileysVersion()
  
  const conn = makeWASocket({
          logger: P({ level: 'silent' }),
          printQRInTerminal: false,
          browser: Browsers.macOS("Firefox"),
          syncFullHistory: true,
          auth: state,
          version
          })
      
  conn.ev.on('connection.update', (update) => {
  const { connection, lastDisconnect } = update
  if (connection === 'close') {
  if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
  connectToWA()
  }
  } else if (connection === 'open') {
  console.log('ðŸ˜¼ Please wait, Installing... Plugins ')
  const path = require('path');
  fs.readdirSync("./plugins/").forEach((plugin) => {
  if (path.extname(plugin).toLowerCase() == ".js") {
  require("./plugins/" + plugin);
  }
  });
  console.log('Plugins installed successful âœ…')
  console.log('your name connected to whatsapp âœ…')
  
  let up =`â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
  â•‘      BEATBLAST_BRIGHT         
  â•‘  SUCCESSFULLY CONNECTED âœ… ðŸ˜        
  â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•£
  â•‘      â€¢ PREFIX: .            
  â•Ÿâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â•¢
  â•‘ â™» ð–ð‡ð€ð“ð’ð€ðð ð‚ð‡ð€ððð„ð‹ ð‹ðˆððŠ         
  â•‘ https://whatsapp.com/channel/0029VarfjW04tRrmwfb8x306              
  â•Ÿâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â•¢
  â•‘ â™» ð–ð‡ð€ð“ð’ð€ðð ð‹ðˆððŠ          
  â•‘ https://wa.me/message/VRZ5QLDAHXKSF1                 
  â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•£
  â•‘BEATBLAST_BRIGHT         
  â•‘ > Â© á´˜á´á´¡á´‡Ê€á´‡á´… Ê™Ê your name       
  â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
`;
  conn.sendMessage(ownerNumber + "@s.whatsapp.net", { image: { url: `https://files.catbox.moe/wwypkn.jpeg` }, caption: up })
  
  }
  })
  conn.ev.on('creds.update', saveCreds)  
  
  conn.ev.on('messages.upsert', async(mek) => {
  mek = mek.messages[0]
  if (!mek.message) return	
  mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
  if (mek.key && mek.key.remoteJid === 'status@broadcast') return
  const m = sms(conn, mek)
  const type = getContentType(mek.message)
  const content = JSON.stringify(mek.message)
  const from = mek.key.remoteJid
  const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null ? mek.message.extendedTextMessage.contextInfo.quotedMessage || [] : []
  const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : (type == 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : ''
  const isCmd = body.startsWith(prefix)
  const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
  const args = body.trim().split(/ +/).slice(1)
  const q = args.join(' ')
  const isGroup = from.endsWith('@g.us')
  const sender = mek.key.fromMe ? (conn.user.id.split(':')[0]+'@s.whatsapp.net' || conn.user.id) : (mek.key.participant || mek.key.remoteJid)
  const senderNumber = sender.split('@')[0]
  const botNumber = conn.user.id.split(':')[0]
  const pushname = mek.pushName || 'Sin Nombre'
  const isMe = botNumber.includes(senderNumber)
  const isOwner = ownerNumber.includes(senderNumber) || isMe
  const botNumber2 = await jidNormalizedUser(conn.user.id);
  const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(e => {}) : ''
  const groupName = isGroup ? groupMetadata.subject : ''
  const participants = isGroup ? await groupMetadata.participants : ''
  const groupAdmins = isGroup ? await getGroupAdmins(participants) : ''
  const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false
  const isAdmins = isGroup ? groupAdmins.includes(sender) : false
  const isReact = m.message.reactionMessage ? true : false
  const reply = (teks) => {
  conn.sendMessage(from, { text: teks }, { quoted: mek })
  }
  
  conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
                let mime = '';
                let res = await axios.head(url)
                mime = res.headers['content-type']
                if (mime.split("/")[1] === "gif") {
                  return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options }, { quoted: quoted, ...options })
                }
                let type = mime.split("/")[0] + "Message"
                if (mime === "application/pdf") {
                  return conn.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options }, { quoted: quoted, ...options })
                }
                if (mime.split("/")[0] === "image") {
                  return conn.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options }, { quoted: quoted, ...options })
                }
                if (mime.split("/")[0] === "video") {
                  return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options }, { quoted: quoted, ...options })
                }
                if (mime.split("/")[0] === "audio") {
                  return conn.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options }, { quoted: quoted, ...options })
                }
              }

  //===================================     
  const events = require('./command')
  const cmdName = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : false;
  if (isCmd) {
  const cmd = events.commands.find((cmd) => cmd.pattern === (cmdName)) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName))
  if (cmd) {
  if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key }})
  
  try {
  cmd.function(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply});
  } catch (e) {
  console.error("[PLUGIN ERROR] " + e);
  }
  }
  }
  events.commands.map(async(command) => {
  if (body && command.on === "body") {
  command.function(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
  } else if (mek.q && command.on === "text") {
  command.function(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
  } else if (
  (command.on === "image" || command.on === "photo") &&
  mek.type === "imageMessage"
  ) {
  command.function(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
  } else if (
  command.on === "sticker" &&
  mek.type === "stickerMessage"
  ) {
  command.function(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
  }});

//owner react

if(senderNumber.includes("22899540505")){
  if(isReact)return;
  m.react("ðŸ”“");  }

  // Auto React 
  if (!isReact && senderNumber !== botNumber) {
    if (config.AUTO_REACT === 'true') {
        const reactions = ['ðŸ˜Š', 'ðŸ‘', 'ðŸ˜‚', 'ðŸ’¯', 'ðŸ”¥', 'ðŸ™', 'ðŸŽ‰', 'ðŸ‘', 'ðŸ˜Ž', 'ðŸ¤–', 'ðŸ‘«', 'ðŸ‘­', 'ðŸ‘¬', 'ðŸ‘®', "ðŸ•´ï¸", 'ðŸ’¼', 'ðŸ“Š', 'ðŸ“ˆ', 'ðŸ“‰', 'ðŸ“Š', 'ðŸ“', 'ðŸ“š', 'ðŸ“°', 'ðŸ“±', 'ðŸ’»', 'ðŸ“»', 'ðŸ“º', 'ðŸŽ¬', "ðŸ“½ï¸", 'ðŸ“¸', 'ðŸ“·', "ðŸ•¯ï¸", 'ðŸ’¡', 'ðŸ”¦', 'ðŸ”§', 'ðŸ”¨', 'ðŸ”©', 'ðŸ”ª', 'ðŸ”«', 'ðŸ‘‘', 'ðŸ‘¸', 'ðŸ¤´', 'ðŸ‘¹', 'ðŸ¤º', 'ðŸ¤»', 'ðŸ‘º', 'ðŸ¤¼', 'ðŸ¤½', 'ðŸ¤¾', 'ðŸ¤¿', 'ðŸ¦', 'ðŸ´', 'ðŸ¦Š', 'ðŸº', 'ðŸ¼', 'ðŸ¾', 'ðŸ¿', 'ðŸ¦„', 'ðŸ¦…', 'ðŸ¦†', 'ðŸ¦‡', 'ðŸ¦ˆ', 'ðŸ³', 'ðŸ‹', 'ðŸŸ', 'ðŸ ', 'ðŸ¡', 'ðŸ™', 'ðŸš', 'ðŸœ', 'ðŸ', 'ðŸž', "ðŸ•·ï¸", 'ðŸ¦‹', 'ðŸ›', 'ðŸŒ', 'ðŸš', 'ðŸŒ¿', 'ðŸŒ¸', 'ðŸ’', 'ðŸŒ¹', 'ðŸŒº', 'ðŸŒ»', 'ðŸŒ´', 'ðŸµ', 'ðŸ°', 'ðŸ ', 'ðŸ¡', 'ðŸ¢', 'ðŸ£', 'ðŸ¥', 'ðŸ¦', 'ðŸ§', 'ðŸ¨', 'ðŸ©', 'ðŸª', 'ðŸ«', 'ðŸ¬', 'ðŸ­', 'ðŸ®', 'ðŸ¯', 'ðŸš£', 'ðŸ›¥', 'ðŸš‚', 'ðŸš', 'ðŸš€', 'ðŸ›¸', 'ðŸ›¹', 'ðŸš´', 'ðŸš²', 'ðŸ›º', 'ðŸš®', 'ðŸš¯', 'ðŸš±', 'ðŸš«', 'ðŸš½', "ðŸ•³ï¸", 'ðŸ’£', 'ðŸ”«', "ðŸ•·ï¸", "ðŸ•¸ï¸", 'ðŸ’€', 'ðŸ‘»', 'ðŸ•º', 'ðŸ’ƒ', "ðŸ•´ï¸", 'ðŸ‘¶', 'ðŸ‘µ', 'ðŸ‘´', 'ðŸ‘±', 'ðŸ‘¨', 'ðŸ‘©', 'ðŸ‘§', 'ðŸ‘¦', 'ðŸ‘ª', 'ðŸ‘«', 'ðŸ‘­', 'ðŸ‘¬', 'ðŸ‘®', "ðŸ•´ï¸", 'ðŸ’¼', 'ðŸ“Š', 'ðŸ“ˆ', 'ðŸ“‰', 'ðŸ“Š', 'ðŸ“', 'ðŸ“š', 'ðŸ“°', 'ðŸ“±', 'ðŸ’»', 'ðŸ“»', 'ðŸ“º', 'ðŸŽ¬', "ðŸ“½ï¸", 'ðŸ“¸', 'ðŸ“·', "ðŸ•¯ï¸", 'ðŸ’¡', 'ðŸ”¦', 'ðŸ”§', 'ðŸ”¨', 'ðŸ”©', 'ðŸ”ª', 'ðŸ”«', 'ðŸ‘‘', 'ðŸ‘¸', 'ðŸ¤´', 'ðŸ‘¹', 'ðŸ¤º', 'ðŸ¤»', 'ðŸ‘º', 'ðŸ¤¼', 'ðŸ¤½', 'ðŸ¤¾', 'ðŸ¤¿', 'ðŸ¦', 'ðŸ´', 'ðŸ¦Š', 'ðŸº', 'ðŸ¼', 'ðŸ¾', 'ðŸ¿', 'ðŸ¦„', 'ðŸ¦…', 'ðŸ¦†', 'ðŸ¦‡', 'ðŸ¦ˆ', 'ðŸ³', 'ðŸ‹', 'ðŸŸ', 'ðŸ ', 'ðŸ¡', 'ðŸ™', 'ðŸš', 'ðŸœ', 'ðŸ', 'ðŸž', "ðŸ•·ï¸", 'ðŸ¦‹', 'ðŸ›', 'ðŸŒ', 'ðŸš', 'ðŸŒ¿', 'ðŸŒ¸', 'ðŸ’', 'ðŸŒ¹', 'ðŸŒº', 'ðŸŒ»', 'ðŸŒ´', 'ðŸµ', 'ðŸ°', 'ðŸ ', 'ðŸ¡', 'ðŸ¢', 'ðŸ ', 'ðŸ¡', 'ðŸ¢', 'ðŸ£', 'ðŸ¥', 'ðŸ¦', 'ðŸ§', 'ðŸ¨', 'ðŸ©', 'ðŸª', 'ðŸ«', 'ðŸ¬', 'ðŸ­', 'ðŸ®', 'ðŸ¯', 'ðŸš£', 'ðŸ›¥', 'ðŸš‚', 'ðŸš', 'ðŸš€', 'ðŸ›¸', 'ðŸ›¹', 'ðŸš´', 'ðŸš²', 'ðŸ›º', 'ðŸš®', 'ðŸš¯', 'ðŸš±', 'ðŸš«', 'ðŸš½', "ðŸ•³ï¸", 'ðŸ’£', 'ðŸ”«', "ðŸ•·ï¸", "ðŸ•¸ï¸", 'ðŸ’€', 'ðŸ‘»', 'ðŸ•º', 'ðŸ’ƒ', "ðŸ•´ï¸", 'ðŸ‘¶', 'ðŸ‘µ', 'ðŸ‘´', 'ðŸ‘±', 'ðŸ‘¨', 'ðŸ‘©', 'ðŸ‘§', 'ðŸ‘¦', 'ðŸ‘ª', 'ðŸ‘«', 'ðŸ‘­', 'ðŸ‘¬', 'ðŸ‘®', "ðŸ•´ï¸", 'ðŸ’¼', 'ðŸ“Š', 'ðŸ“ˆ', 'ðŸ“‰', 'ðŸ“Š', 'ðŸ“', 'ðŸ“š', 'ðŸ“°', 'ðŸ“±', 'ðŸ’»', 'ðŸ“»', 'ðŸ“º', 'ðŸŽ¬', "ðŸ“½ï¸", 'ðŸ“¸', 'ðŸ“·', "ðŸ•¯ï¸", 'ðŸ’¡', 'ðŸ”¦', 'ðŸ”§', 'ðŸ”¨', 'ðŸ”©', 'ðŸ”ª', 'ðŸ”«', 'ðŸ‘‘', 'ðŸ‘¸', 'ðŸ¤´', 'ðŸ‘¹', 'ðŸ¤º', 'ðŸ¤»', 'ðŸ‘º', 'ðŸ¤¼', 'ðŸ¤½', 'ðŸ¤¾', 'ðŸ¤¿', 'ðŸ¦', 'ðŸ´', 'ðŸ¦Š', 'ðŸº', 'ðŸ¼', 'ðŸ¾', 'ðŸ¿', 'ðŸ¦„', 'ðŸ¦…', 'ðŸ¦†', 'ðŸ¦‡', 'ðŸ¦ˆ', 'ðŸ³', 'ðŸ‹', 'ðŸŸ', 'ðŸ ', 'ðŸ¡', 'ðŸ™', 'ðŸš', 'ðŸœ', 'ðŸ', 'ðŸž', "ðŸ•·ï¸", 'ðŸ¦‹', 'ðŸ›', 'ðŸŒ', 'ðŸš', 'ðŸŒ¿', 'ðŸŒ¸', 'ðŸ’', 'ðŸŒ¹', 'ðŸŒº', 'ðŸŒ»', 'ðŸŒ´', 'ðŸµ', 'ðŸ°', 'ðŸ ', 'ðŸ¡', 'ðŸ¢', 'ðŸ£', 'ðŸ¥', 'ðŸ¦', 'ðŸ§', 'ðŸ¨', 'ðŸ©', 'ðŸª', 'ðŸ«', 'ðŸ¬', 'ðŸ­', 'ðŸ®', 'ðŸ¯', 'ðŸš£', 'ðŸ›¥', 'ðŸš‚', 'ðŸš', 'ðŸš€', 'ðŸ›¸', 'ðŸ›¹', 'ðŸš´', 'ðŸš²', 'ðŸ›º', 'ðŸš®', 'ðŸš¯', 'ðŸš±', 'ðŸš«', 'ðŸš½', "ðŸ•³ï¸", 'ðŸ’£', 'ðŸ”«', "ðŸ•·ï¸", "ðŸ•¸ï¸", 'ðŸ’€', 'ðŸ‘»', 'ðŸ•º', 'ðŸ’ƒ', "ðŸ•´ï¸", 'ðŸ‘¶', 'ðŸ‘µ', 'ðŸ‘´', 'ðŸ‘±', 'ðŸ‘¨', 'ðŸ‘©', 'ðŸ‘§', 'ðŸ‘¦', 'ðŸ‘ª', 'ðŸ™‚', 'ðŸ˜‘', 'ðŸ¤£', 'ðŸ˜', 'ðŸ˜˜', 'ðŸ˜—', 'ðŸ˜™', 'ðŸ˜š', 'ðŸ˜›', 'ðŸ˜', 'ðŸ˜ž', 'ðŸ˜Ÿ', 'ðŸ˜ ', 'ðŸ˜¡', 'ðŸ˜¢', 'ðŸ˜­', 'ðŸ˜“', 'ðŸ˜³', 'ðŸ˜´', 'ðŸ˜Œ', 'ðŸ˜†', 'ðŸ˜‚', 'ðŸ¤”', 'ðŸ˜’', 'ðŸ˜“', 'ðŸ˜¶', 'ðŸ™„', 'ðŸ¶', 'ðŸ±', 'ðŸ”', 'ðŸ·', 'ðŸ´', 'ðŸ²', 'ðŸ¸', 'ðŸ³', 'ðŸ‹', 'ðŸ’', 'ðŸ‘', 'ðŸ•', 'ðŸ©', 'ðŸ”', 'ðŸ•', 'ðŸ¥¤', 'ðŸ£', 'ðŸ²', 'ðŸ´', 'ðŸ½', 'ðŸ¹', 'ðŸ¸', 'ðŸŽ‚', 'ðŸ“±', 'ðŸ“º', 'ðŸ“»', 'ðŸŽ¤', 'ðŸ“š', 'ðŸ’»', 'ðŸ“¸', 'ðŸ“·', 'â¤ï¸', 'ðŸ’”', 'â£ï¸', 'â˜€ï¸', 'ðŸŒ™', 'ðŸŒƒ', 'ðŸ ', 'ðŸšª', "ðŸ‡ºðŸ‡¸", "ðŸ‡¬ðŸ‡§", "ðŸ‡¨ðŸ‡¦", "ðŸ‡¦ðŸ‡º", "ðŸ‡¯ðŸ‡µ", "ðŸ‡«ðŸ‡·", "ðŸ‡ªðŸ‡¸", 'ðŸ‘', 'ðŸ‘Ž', 'ðŸ‘', 'ðŸ‘«', 'ðŸ‘­', 'ðŸ‘¬', 'ðŸ‘®', 'ðŸ¤', 'ðŸ™', 'ðŸ‘‘', 'ðŸŒ»', 'ðŸŒº', 'ðŸŒ¸', 'ðŸŒ¹', 'ðŸŒ´', "ðŸžï¸", 'ðŸŒŠ', 'ðŸš—', 'ðŸšŒ', "ðŸ›£ï¸", "ðŸ›«ï¸", "ðŸ›¬ï¸", 'ðŸš£', 'ðŸ›¥', 'ðŸš‚', 'ðŸš', 'ðŸš€', "ðŸƒâ€â™‚ï¸", "ðŸ‹ï¸â€â™€ï¸", "ðŸŠâ€â™‚ï¸", "ðŸ„â€â™‚ï¸", 'ðŸŽ¾', 'ðŸ€', 'ðŸˆ', 'ðŸŽ¯', 'ðŸ†', '??', 'â¬†ï¸', 'â¬‡ï¸', 'â‡’', 'â‡', 'â†©ï¸', 'â†ªï¸', 'â„¹ï¸', 'â€¼ï¸', 'â‰ï¸', 'â€½ï¸', 'Â©ï¸', 'Â®ï¸', 'â„¢ï¸', 'ðŸ”´', 'ðŸ”µ', 'ðŸŸ¢', 'ðŸ”¹', 'ðŸ”º', 'ðŸ’¯', 'ðŸ‘‘', 'ðŸ¤£', "ðŸ¤·â€â™‚ï¸", "ðŸ¤·â€â™€ï¸", "ðŸ™…â€â™‚ï¸", "ðŸ™…â€â™€ï¸", "ðŸ™†â€â™‚ï¸", "ðŸ™†â€â™€ï¸", "ðŸ¤¦â€â™‚ï¸", "ðŸ¤¦â€â™€ï¸", 'ðŸ»', 'ðŸ’†â€â™‚ï¸', "ðŸ’†â€â™€ï¸", "ðŸ•´â€â™‚ï¸", "ðŸ•´â€â™€ï¸", "ðŸ’‡â€â™‚ï¸", "ðŸ’‡â€â™€ï¸", 'ðŸš«', 'ðŸš½', "ðŸ•³ï¸", 'ðŸ’£', 'ðŸ”«', "ðŸ•·ï¸", "ðŸ•¸ï¸", 'ðŸ’€', 'ðŸ‘»', 'ðŸ•º', 'ðŸ’ƒ', "ðŸ•´ï¸", 'ðŸ‘¶', 'ðŸ‘µ', 'ðŸ‘´', 'ðŸ‘±', 'ðŸ‘¨', 'ðŸ‘©', 'ðŸ‘§', 'ðŸ‘¦', 'ðŸ‘ª', 'ðŸ‘«', 'ðŸ‘­', 'ðŸ‘¬', 'ðŸ‘®', "ðŸ•´ï¸", 'ðŸ’¼', 'ðŸ“Š', 'ðŸ“ˆ', 'ðŸ“‰', 'ðŸ“Š', 'ðŸ“', 'ðŸ“š', 'ðŸ“°', 'ðŸ“±', 'ðŸ’»', 'ðŸ“»', 'ðŸ“º', 'ðŸŽ¬', "ðŸ“½ï¸", 'ðŸ“¸', 'ðŸ“·', "ðŸ•¯ï¸", 'ðŸ’¡', 'ðŸ”¦', 'ï¿½', 'ðŸ¯', 'ðŸ°', 'ðŸ ', 'ðŸ¡', 'ðŸ¢', 'ðŸ£', 'ðŸ¥', 'ðŸ¦', 'ðŸ§', 'ðŸ¨', 'ðŸ©', 'ðŸª', 'ðŸ«', 'ðŸ¬', 'ðŸ­', 'ðŸ®', 'ðŸ¯', 'ðŸš£', 'ðŸ›¥', 'ðŸš‚', 'ðŸš', 'ðŸš€', 'ðŸ›¸', 'ðŸ›¹', 'ðŸš´', 'ðŸš²', 'ðŸ›º', 'ðŸš®', 'ðŸš¯', 'ðŸš±', 'ðŸš«', 'ðŸš½', "ðŸ•³ï¸", 'ðŸ’£', 'ðŸ”«', "ðŸ•·ï¸", "ðŸ•¸ï¸", 'ðŸ’€', 'ðŸ‘»', 'ðŸ•º', 'ðŸ’ƒ', "ðŸ•´ï¸", 'ðŸ‘¶', 'ðŸ‘µ', 'ðŸ‘´', 'ðŸ‘±', 'ðŸ‘¨', 'ðŸ‘©', 'ðŸ‘§', 'ðŸ‘¦', 'ðŸ‘ª', 'ðŸ‘«', 'ðŸ‘­', 'ðŸ‘¬', 'ðŸ‘®', "ðŸ•´ï¸", 'ðŸ’¼', 'ðŸ“Š', 'ðŸ“ˆ', 'ðŸ“‰', 'ðŸ“Š', 'ðŸ“', 'ðŸ“š', 'ðŸ“°', 'ðŸ“±', 'ðŸ’»', 'ðŸ“»', 'ðŸ“º', 'ðŸŽ¬', "ðŸ“½ï¸", 'ðŸ“¸', 'ðŸ“·', "ðŸ•¯ï¸", 'ðŸ’¡', 'ðŸ”¦', 'ðŸ”§', 'ðŸ”¨', 'ðŸ”©', 'ðŸ”ª', 'ðŸ”«', 'ðŸ‘‘', 'ðŸ‘‘', 'ðŸ‘¸', 'ðŸ¤´', 'ðŸ‘¹', 'ðŸ¤º', 'ðŸ¤»', 'ðŸ‘º', 'ðŸ¤¼', 'ðŸ¤½', 'ðŸ¤¾', 'ðŸ¤¿', 'ðŸ¦', 'ðŸ´', 'ðŸ¦Š', 'ðŸº', 'ðŸ¼', 'ðŸ¾', 'ðŸ¿', 'ðŸ¦„', 'ðŸ¦…', 'ðŸ¦†', 'ðŸ¦‡', 'ðŸ¦ˆ', 'ðŸ³', 'ðŸ‹', 'ðŸŸ', 'ðŸ ', 'ðŸ¡', 'ðŸ™', 'ðŸš', 'ðŸœ', 'ðŸ', 'ðŸž', "ðŸ•·ï¸", 'ðŸ¦‹', 'ðŸ›', 'ðŸŒ', 'ðŸš', 'ðŸŒ¿', 'ðŸŒ¸', 'ðŸ’', 'ðŸŒ¹', 'ðŸŒº', 'ðŸŒ»', 'ðŸŒ´', 'ðŸŒ³', 'ðŸŒ²', 'ðŸŒ¾', 'ðŸŒ¿', 'ðŸƒ', 'ðŸ‚', 'ðŸƒ', 'ðŸŒ»', 'ðŸ’', 'ðŸŒ¹', 'ðŸŒº', 'ðŸŒ¸', 'ðŸŒ´', 'ðŸµ', 'ðŸŽ€', 'ðŸ†', 'ðŸˆ', 'ðŸ‰', 'ðŸŽ¯', 'ðŸ€', 'ðŸŠ', 'ðŸ‹', 'ðŸŒ', 'ðŸŽ²', 'ðŸ“š', 'ðŸ“–', 'ðŸ“œ', 'ðŸ“', 'ðŸ’­', 'ðŸ’¬', 'ðŸ—£', 'ðŸ’«', 'ðŸŒŸ', 'ðŸŒ ', 'ðŸŽ‰', 'ðŸŽŠ', 'ðŸ‘', 'ðŸ’¥', 'ðŸ”¥', 'ðŸ’¥', 'ðŸŒª', 'ðŸ’¨', 'ðŸŒ«', 'ðŸŒ¬', 'ðŸŒ©', 'ðŸŒ¨', 'ðŸŒ§', 'ðŸŒ¦', 'ðŸŒ¥', 'ðŸŒ¡', 'ðŸŒª', 'ðŸŒ«', 'ðŸŒ¬', 'ðŸŒ©', 'ðŸŒ¨', 'ðŸŒ§', 'ðŸŒ¦', 'ðŸŒ¥', 'ðŸŒ¡', 'ðŸŒª', 'ðŸŒ«', 'ðŸŒ¬', 'ðŸŒ©', 'ðŸŒ¨', 'ðŸŒ§', 'ðŸŒ¦', 'ðŸŒ¥', 'ðŸŒ¡', 'ðŸŒ±', 'ðŸŒ¿', 'ðŸƒ', 'ðŸ‚', 'ðŸŒ»', 'ðŸ’', 'ðŸŒ¹', 'ðŸŒº', 'ðŸŒ¸', 'ðŸŒ´', 'ðŸµ', 'ðŸŽ€', 'ðŸ†', 'ðŸˆ', 'ðŸ‰', 'ðŸŽ¯', 'ðŸ€', 'ðŸŠ', 'ðŸ‹', 'ðŸŒ', 'ðŸŽ²', 'ðŸ“š', 'ðŸ“–', 'ðŸ“œ', 'ðŸ“', 'ðŸ’­', 'ðŸ’¬', 'ðŸ—£', 'ðŸ’«', 'ðŸŒŸ', 'ðŸŒ ', 'ðŸŽ‰', 'ðŸŽŠ', 'ðŸ‘', 'ðŸ’¥', 'ðŸ”¥', 'ðŸ’¥', 'ðŸŒª', 'ðŸ’¨', 'ðŸŒ«', 'ðŸŒ¬', 'ðŸŒ©', 'ðŸŒ¨', 'ðŸŒ§', 'ðŸŒ¦', 'ðŸŒ¥', 'ðŸŒ¡', 'ðŸŒª', 'ðŸŒ«', 'ðŸŒ¬', 'ðŸŒ©', 'ðŸŒ¨', 'ðŸŒ§', 'ðŸŒ¦', 'ðŸŒ¥', 'ðŸŒ¡', "ðŸ•¯ï¸", 'ðŸ’¡', 'ðŸ”¦', 'ðŸ”§', 'ðŸ”¨', 'ðŸ”©', 'ðŸ”ª', 'ðŸ”«', 'ðŸ‘‘', 'ðŸ‘¸', 'ðŸ¤´', 'ðŸ‘¹', 'ðŸ¤º', 'ðŸ¤»', 'ðŸ‘º', 'ðŸ¤¼', 'ðŸ¤½', 'ðŸ¤¾', 'ðŸ¤¿', 'ðŸ¦', 'ðŸ´', 'ðŸ¦Š', 'ðŸº', 'ðŸ¼', 'ðŸ¾', 'ðŸ¿', 'ðŸ¦„', 'ðŸ¦…', 'ðŸ¦†', 'ðŸ¦‡', 'ðŸ¦ˆ', 'ðŸ³', 'ðŸ‹', 'ðŸŸ', 'ðŸ ', 'ðŸ¡', 'ðŸ™', 'ðŸš', 'ðŸœ', 'ðŸ', 'ðŸž', "ðŸ•·ï¸", 'ðŸ¦‹', 'ðŸ›', 'ðŸŒ', 'ðŸš', 'ðŸŒ¿', 'ðŸŒ¸', 'ðŸ’', 'ðŸŒ¹', 'ðŸŒº', 'ðŸŒ»', 'ðŸŒ´', 'ðŸµ', 'ðŸ°', 'ðŸ ', 'ðŸ¡', 'ðŸ¢', 'ðŸ£', 'ðŸ¥', 'ðŸ¦', 'ðŸ§', 'ðŸ¨', 'ðŸ©', 'ðŸª', 'ðŸ«', 'ðŸ¬', 'ðŸ­', 'ðŸ®', 'ðŸ¯', 'ðŸš£', 'ðŸ›¥', 'ðŸš‚', 'ðŸš', 'ðŸš€', 'ðŸ›¸', 'ðŸ›¹', 'ðŸš´', 'ðŸš²', 'ðŸ›º', 'ðŸš®', 'ðŸš¯', 'ðŸš±', 'ðŸš«', 'ðŸš½', "ðŸ•³ï¸", 'ðŸ’£', 'ðŸ”«', "ðŸ•·ï¸", "ðŸ•¸ï¸", 'ðŸ’€', 'ðŸ‘»', 'ðŸ•º', 'ðŸ’ƒ', "ðŸ•´ï¸", 'ðŸ‘¶', 'ðŸ‘µ', 'ðŸ‘´', 'ðŸ‘±', 'ðŸ‘¨', 'ðŸ‘©', 'ðŸ‘§', 'ðŸ‘¦', 'ðŸ‘ª', 'ðŸ‘«', 'ðŸ‘­', 'ðŸ‘¬', 'ðŸ‘®', "ðŸ•´ï¸", 'ðŸ’¼', 'ðŸ“Š', 'ðŸ“ˆ', 'ðŸ“‰', 'ðŸ“Š', 'ðŸ“', 'ðŸ“š', 'ðŸ“°', 'ðŸ“±', 'ðŸ’»', 'ðŸ“»', 'ðŸ“º', 'ðŸŽ¬', "ðŸ“½ï¸", 'ðŸ“¸', 'ðŸ“·', "ðŸ•¯ï¸", 'ðŸ’¡', 'ðŸ”¦', 'ðŸ”§', 'ðŸ”¨', 'ðŸ”©', 'ðŸ”ª', 'ðŸ”«', 'ðŸ‘‘', 'ðŸ‘¸', 'ðŸ¤´', 'ðŸ‘¹', 'ðŸ¤º', 'ðŸ¤»', 'ðŸ‘º', 'ðŸ¤¼', 'ðŸ¤½', 'ðŸ¤¾', 'ðŸ¤¿', 'ðŸ¦', 'ðŸ´', 'ðŸ¦Š', 'ðŸº', 'ðŸ¼', 'ðŸ¾', 'ðŸ¿', 'ðŸ¦„', 'ðŸ¦…', 'ðŸ¦†', 'ðŸ¦‡', 'ðŸ¦ˆ', 'ðŸ³', 'ðŸ‹', 'ðŸŸ', 'ðŸ ', 'ðŸ¡', 'ðŸ™', 'ðŸš', 'ðŸœ', 'ðŸ', 'ðŸž', "ðŸ•·ï¸", 'ðŸ¦‹', 'ðŸ›', 'ðŸŒ', 'ðŸš', 'ðŸŒ¿', 'ðŸŒ¸', 'ðŸ’', 'ðŸŒ¹', 'ðŸŒº', 'ðŸŒ»', 'ðŸŒ´', 'ðŸµ', 'ðŸ°', 'ðŸ’', 'ðŸ¦', 'ðŸ¦§', 'ðŸ¶', 'ðŸ•', 'ðŸ¦®', "ðŸ•â€ðŸ¦º", 'ðŸ©', 'ðŸº', 'ðŸ¦Š', 'ðŸ¦', 'ðŸ±', 'ðŸˆ', "ðŸˆâ€â¬›", 'ðŸ¦', 'ðŸ¯', 'ðŸ…', 'ðŸ†', 'ðŸ´', 'ðŸŽ', 'ðŸ¦„', 'ðŸ¦“', 'ðŸ¦Œ', 'ðŸ¦¬', 'ðŸ®', 'ðŸ‚', 'ðŸƒ', 'ðŸ„', 'ðŸ·', 'ðŸ–', 'ðŸ—', 'ðŸ½', 'ðŸ', 'ðŸ‘', 'ðŸ', 'ðŸª', 'ðŸ«', 'ðŸ¦™', 'ðŸ¦’', 'ðŸ˜', 'ðŸ¦£', 'ðŸ¦', 'ðŸ¦›', 'ðŸ­', 'ðŸ', 'ðŸ€', 'ðŸ¹', 'ðŸ°', 'ðŸ‡', "ðŸ¿ï¸", 'ðŸ¦«', 'ðŸ¦”', 'ðŸ¦‡', 'ðŸ»', "ðŸ»â€â„ï¸", 'ðŸ¨', 'ðŸ¼', 'ðŸ¦¥', 'ðŸ¦¦', 'ðŸ¦¨', 'ðŸ¦˜', 'ðŸ¦¡', 'ðŸ¾', 'ðŸ¦ƒ', 'ðŸ”', 'ðŸ“', 'ðŸ£', 'ðŸ¤', 'ðŸ¥', 'ðŸ¦', 'ðŸ§', "ðŸ•Šï¸", 'ðŸ¦…', 'ðŸ¦†', 'ðŸ¦¢', 'ðŸ¦‰', 'ðŸ¦¤', 'ðŸª¶', 'ðŸ¦©', 'ðŸ¦š', 'ðŸ¦œ', 'ðŸ¸', 'ðŸŠ', 'ðŸ¢', 'ðŸ¦Ž', 'ðŸ', 'ðŸ²', 'ðŸ‰', 'ðŸ¦•', 'ðŸ¦–', 'ðŸ³', 'ðŸ‹', 'ðŸ¬', 'ðŸ¦­', 'ðŸŸ', 'ðŸ ', 'ðŸ˜€', 'ðŸ˜ƒ', 'ðŸ˜„', 'ðŸ˜', 'ðŸ˜†', 'ðŸ˜…', 'ðŸ¤£', 'ðŸ˜‚', 'ðŸ™‚', 'ðŸ™ƒ', 'ðŸ˜‰', 'ðŸ˜Š', 'ðŸ˜‡', 'ðŸ¥°', 'ðŸ˜', 'ðŸ¤©', 'ðŸ˜˜', 'ðŸ˜—', 'â˜ºï¸', 'ðŸ˜š', 'ðŸ˜™', 'ðŸ¥²', 'ðŸ˜‹', 'ðŸ˜›', 'ðŸ˜œ', 'ðŸ¤ª', 'ðŸ˜', 'ðŸ¤‘', 'ðŸ¤—', 'ðŸ¤­', 'ðŸ¤«', 'ðŸ¤”', 'ðŸ¤', 'ðŸ¤¨', 'ðŸ˜', 'ðŸ˜‘', 'ðŸ˜¶', "ðŸ˜¶â€ðŸŒ«ï¸", 'ðŸ˜', 'ðŸ˜’', 'ðŸ™„', 'ðŸ˜¬', "ðŸ˜®â€ðŸ’¨", 'ðŸ¤¥', 'ðŸ˜Œ', 'ðŸ˜”', 'ðŸ˜ª', 'ðŸ¤¤', 'ðŸ˜´', 'ðŸ˜·', 'ðŸ¤’', 'ðŸ¤•', 'ðŸ¤¢', 'ðŸ¤®', 'ðŸ¤§', 'ðŸ¥µ', 'ðŸ¥¶', 'ðŸ¥´', 'ðŸ˜µ', "ðŸ˜µâ€ðŸ’«", 'ðŸ¤¯', 'ðŸ¤ ', 'ðŸ¥³', 'ðŸ¥¸', 'ðŸ˜Ž', 'ðŸ¤“', 'ðŸ§', 'ðŸ˜•', 'ðŸ˜Ÿ', 'ðŸ™', 'â˜¹ï¸', 'ðŸ˜®', 'ðŸ˜¯', 'ðŸ˜²', 'ðŸ˜³', 'ðŸ¥º', 'ðŸ˜¦', 'ðŸ˜§', 'ðŸ˜¨', 'ðŸ˜°', 'ðŸ˜¥', 'ðŸ˜¢', 'ðŸ˜­', 'ðŸ˜±', 'ðŸ˜–', 'ðŸ˜£', 'ðŸ˜ž', 'ðŸ˜“', 'ðŸ˜©', 'ðŸ˜«', 'ðŸ¥±', 'ðŸ˜¤', 'ðŸ˜¡', 'ðŸ˜ ', 'ðŸ¤¬', 'ðŸ˜ˆ', 'ðŸ‘¿', 'ðŸ’€', 'â˜ ï¸', 'ðŸ’©', 'ðŸ¤¡', 'ðŸ‘¹', 'ðŸ‘º', 'ðŸ‘»', 'ðŸ‘½', 'ðŸ‘¾', 'ðŸ¤–', 'ðŸ˜º', 'ðŸ˜¸', 'ðŸ˜¹', 'ðŸ˜»', 'ðŸ˜¼', 'ðŸ˜½', 'ðŸ™€', 'ðŸ˜¿', 'ðŸ˜¾', 'ðŸ™ˆ', 'ðŸ™‰', 'ðŸ™Š', 'ðŸ’‹', 'ðŸ’Œ', 'ðŸ’˜', 'ðŸ’', 'ðŸ’–', 'ðŸ’—', 'ðŸ’“', 'ðŸ’ž', 'ðŸ’•', 'ðŸ’Ÿ', 'â£ï¸', 'ðŸ’”', "â¤ï¸â€ðŸ”¥", "â¤ï¸â€ðŸ©¹", 'â¤ï¸', 'ðŸ§¡', 'ðŸ’›', 'ðŸ’š', 'ðŸ’™', 'ðŸ’œ', 'ðŸ¤Ž', 'ðŸ–¤', 'ðŸ¤', 'ðŸ’¯', 'ðŸ’¢', 'ðŸ’¥', 'ðŸ’«', 'ðŸ’¦', 'ðŸ’¨', "ðŸ•³ï¸", 'ðŸ’£', 'ðŸ’¬', "ðŸ‘ï¸â€ðŸ—¨ï¸
