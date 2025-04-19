const express = require("express")
const https = require("https")
const { ExpressPeerServer } = require("peer")
const fs = require("fs")

const config = require("dotenv").config()

const sslOptions = {
  key: fs.readFileSync(config.parsed.privKey),
  cert: fs.readFileSync(config.parsed.cert)
};

// Setup express
const app = express()

app.use(express.static("static"))

// Setup routes

// Home
app.get("/:id", (req, res) => {
  res.sendFile("client.html", {
    root: "templates/"
  })
})

app.get("/", (req, res) => {
  res.sendFile("host.html", {
    root: "templates/"
  })
})

// Start express
const server = https.createServer(sslOptions, app)

const peerServer = ExpressPeerServer(server, {
  path: "/"
})

app.use("/peerjs", peerServer)

server.listen(2048)