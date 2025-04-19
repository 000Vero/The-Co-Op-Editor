var id = window.location.pathname.replace("/", "")

var dataCons = []
var dataPeers = []

// Setup PeerJS
const peerOptions = {
  host: "/",
  port: 443,
  path: "/peerjs",
  secure: true
}

var peer

peer = new Peer(peerOptions)

// Get peer id
peer.on("open", function (id) {
  document.getElementById("share").style.display = "unset";
  invite = `${window.location}${id}`;
})

peer.on("connection", function (dataCon) {
  console.log("[Host] Got data connection")
  dataCons.push(dataCon)
  dataPeers.push(dataCon.peer)
  dataCon.on("data", function (data) {
    if (data == "REQUEST_PEERS") {
      cleanDeadCons()
      dataCon.send({
        peers: dataPeers
      })
    } else if (data == "GET_FILE") {
      dataCon.send({
        file: editor.getValue()
      })
    } else if (data == "ASK_CALL") {
      voiceCall(dataCon.peer)
    } else {
      updateFile(data)
    }
  })
})