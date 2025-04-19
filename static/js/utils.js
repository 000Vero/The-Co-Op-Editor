const micStatus = document.getElementById("mic");
var invite = 0
var call = null
var tried = 0
var audioStream = 0
var audioTracks = []
var calls = []
var joinSound = new Audio("/audio/join.wav")

const allowAudioElement = document.getElementById("allow-audio")

function voiceCall(customId = false, con = false) {
    call = null

    if (audioStream != 0) {
        if (customId) call = peer.call(customId, audioStream, peerOptions)
        else call = peer.call(id, audioStream, peerOptions)
    } else {
        if (con) {
            con.send("ASK_CALL")
            tried++
        }
    }

    if (call == null) return

    calls.push(call)

    if (allowAudioElement) {
        if (allowAudioElement.style.display == "none") joinSound.play()
    } else {
        joinSound.play()
    }

    // On possible answer
    call.on("stream", (stream) => {
        let audio = new Audio()
        audio.srcObject = stream
        audio.play().then(() => {
            if (allowAudioElement) {
                allowAudioElement.style.display = "none"
            }
        }, () => {
            audioTracks.push(audio)
        })
    })
}

function updateFile(data) {
    let cur = editor.getCursorPosition();
    editor.setValue(data.file, -1)
    editor.moveCursorToPosition(cur)
}

function cleanDeadCons() {
    let refreshedCons = []
    let refreshedPeers = []

    // Cleanup dead connections
    for (let i = 0; i < dataCons.length; i++) {
        if (dataCons[i]._open == false) {
            dataCons[i].close()
        } else{
            refreshedCons.push(dataCons[i])
            refreshedPeers.push(dataPeers[i])
        }
    }

    dataCons = refreshedCons
    dataPeers = refreshedPeers
}

// Get call and answer
peer.on("call", function (mediaConnection) {

    console.log("[IO] Got call")

    if (audioStream == 0) {
        console.log("[IO] Answering call")
        mediaConnection.answer()
    } else {
        console.log("[IO] Answering call with stream")
        mediaConnection.answer(audioStream)
    }

    calls.push(mediaConnection)
    console.log("[IO] Call answered")

    if (allowAudioElement) {
        if (allowAudioElement.style.display == "none") joinSound.play()
    } else {
        joinSound.play()
    }

    mediaConnection.on("stream", function (stream) {
        console.log("[IO] Got caller's stream")
        
        let audio = new Audio()
        audio.srcObject = stream
        audio.play().then(() => {
            if (allowAudioElement) {
                allowAudioElement.style.display = "none"
            }
        }, () => {
            audioTracks.push(audio)
        })
    })
})

// Setup voice chat

navigator.mediaDevices.getUserMedia({
    audio: "true",
}).then((stream) => {
    audioStream = stream
    micStatus.classList.remove("bi-mic-mute-fill")
    micStatus.classList.add("bi-mic-fill")
    micStatus.style.color = "white"

    if (tried) {
        // Reconnect calls
        let ids = []
        for (let unicall of calls) {
            ids.push(unicall.peer)
            unicall.close()
        }

        calls = []

        for (let currentId of ids) {
            voiceCall(currentId)
        }

    }
})