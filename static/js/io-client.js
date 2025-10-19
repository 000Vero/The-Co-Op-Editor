var id = window.location.pathname.replace("/", "")

var dataCons = []
var dataPeers = []

// Setup PeerJS
/*
const peerOptions = {
  host: "/",
  port: 443,
  path: "/peerjs",
  secure: true
}
*/

const config = {
  config: {
    iceServers: [
      {
        urls: "turn:coturn.psqsoft.org:3478",
        username: "globalUser",
        credential: "Wnv5G8osVOhRU37K"
      }
    ]
  }
}

var peer

peer = new Peer(undefined, config)

peer.on("open", function () {

  let dataCon = peer.connect(id, peerOptions)
  let dead = setTimeout(() => {
    // Connection failed
    window.location = "/"
  }, 5000)
  dataCons.push(dataCon)
  dataCon.on("open", function () {
    clearTimeout(dead)
    voiceCall(false, dataCon)
    console.log("[Client] Connected to host")
    console.log("[Client] Requesting peers")
    dataCon.send("REQUEST_PEERS")
    dataCon.send("GET_FILE")
  })

  dataCon.on("data", function(data) {
    if (data.file != undefined) {
      updateFile(data)
      return
    }
    
    if (data == "ASK_CALL") {
      voiceCall(dataCon.peer)
    }

    for (let peerCon of data.peers) {
      if (peerCon == peer.id) continue
      let dataCon = peer.connect(peerCon, peerOptions)
      dataCon.on("open", () => {
        voiceCall(peerCon, dataCon)
      })
      dataCons.push(dataCon)
    }
  })
})

peer.on("connection", function (dataCon) {
  console.log("[Client] Got new data connection")
  dataCons.push(dataCon)
  dataCon.on("data", function(data) {
    if (data == "ASK_CALL") {
      voiceCall(dataCon.peer)
      return
    }
    updateFile(data)
  })
})

function allowAudio() {
  document.getElementById("allow-audio").style.display = "none";
  for (let audio of audioTracks) {
    audio.play()
  }
  audioTracks = []
}
