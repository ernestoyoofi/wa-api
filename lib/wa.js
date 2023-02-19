const path = require("path")
const WhatsAppSocket = require("@adiwajshing/baileys").default
const qrcode = require("qrcode-terminal")
const {
  DisconnectReason,
  useMultiFileAuthState,
  useSingleFileAuthState,
  downloadMediaMessage
} = require("@adiwajshing/baileys")
const P = require("pino")

const sd_logs = (msg) => {
  console.log("[LOGS]: ", msg)
}

class WhatsAppClientSocket {
  constructor() {
    this.statusConnected = false
    this.socket = undefined
    this.dir_auth = path.join(process.cwd(), "auth")
  }

  async login() {
//    const { state, saveCreds } = useSingleFileAuthState(this.dir_auth)
    const { state, saveCreds } = await useMultiFileAuthState(this.dir_auth)
    const _cfg_wa = {
      auth: state,
      logger: P({ level: 'silent' }),
      printQRInTerminal: false,
      syncFullHistory: false,
      generateHighQualityLinkPreview: true,
      browser: ["✨ WhatsApp Rest API","chromn","22.13.32"]
    }
    this.socket = WhatsAppSocket(_cfg_wa)
    this.socket.ev.on("connection.update", (updt) => {
      const { connection, lastDisconnect } = updt
      if(updt.qr) {
        sd_logs("📌 Scan This QRCode")
        qrcode.generate(updt.qr, { small: true })
      }
      if(connection === "close") {
        this.statusConnected = false
        sd_logs("📡 Connection is close !")
        const tryConnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
        sd_logs(`📣 Error: ${lastDisconnect.error.message}`)
        if(tryConnect) {
          this.login()
          sd_logs("🔗 Try Connection To WhatsApp")
        }
      }
      if(connection === "open") {
        sd_logs("🔗 Success Connected !")
        this.statusConnected = true
      }
    })
    this.socket.ev.on("creds.update", saveCreds);
  }
}

module.exports = WhatsAppClientSocket
