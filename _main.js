const express = require("express")
const { isJidGroup, isJidUser } = require("@adiwajshing/baileys")
const app = express()
const WhatsApp = require("./lib/wa")

const socket = new WhatsApp()
socket.login()

app.use(express.json())
app.post("/api/send/:jid", (req, res) => {
  const _q = {
    isRelay: req.body?.type === "relay"? true: false,
    a: req.params?.jid,
    b: req.body?.template,
    c: req.body?.add || {}
  }
  res.setHeader("content-type", "application/json")
  if(!socket.statusConnected) {
    return res.status(401).send(JSON.stringify({
      status: 401,
      message: "WhatsApp Not Connected !"
    },null,2))
  }
  const isValidToSend = isJidGroup(_q.a)?true:isJidUser(_q.a)?true:false
  if(!isValidToSend) {
    return res.status(401).send(JSON.stringify({
      status: 401,
      message: "Sender Type Not Valid !"
    },null,2))
  }
  const sending = _q.isRelay?socket.socket.relayMessage(_q.a, _q.b, {}):socket.socket.sendMessage(_q.a, _q.b, _q.c)
  sending.then(_status => {
    res.status(200).send(JSON.stringify({
      status: 200,
      message: "Success Sending ! (Pending)",
      data: {
        key_message: _status.key,
        message: _status.message
      }
    },null,2))
  })
})

app.get("/api/group-info/:id", (req, res) => {
  res.setHeader("content-type", "application/json")
  socket.socket.groupGetInviteInfo(req.params.id).then(_z => {
    res.status(200).send(JSON.stringify({
      status: 200,
      message: "Success",
      data: _z
    },null,2))
  }).catch(_z => {
    res.status(500).send(JSON.stringify({
      status: 500,
      message: "Bad Request",
      data: _z
    },null,2))
  })
})

const port = process.env.PORT || 4510

app.listen(port, () => {
  console.log(`🎉 Server is running in port ${port}`)
})
