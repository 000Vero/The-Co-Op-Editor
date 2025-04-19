const lang = document.getElementById("lang");

// Type name conversion table for Ace
const convert = {
    "text/x-python": "python",
    "text/x-c++src": "c_cpp",
    "text/x-csrc": "c_cpp",
    "application/x-javascript": "javascript",
    "text/x-java": "java",
    "text/html": "html",
    "text/css": "css"
}

// Extension conversion
const extension = {
    "c_cpp": "cxx",
    "python": "py",
    "java": "java",
    "javascript": "js",
    "html": "html",
    "css": "css"
}

// Setup Ace Editor

var editor = ace.edit("editor")
editor.setTheme("ace/theme/gruvbox")
editor.setShowPrintMargin(false)

let type = lang.options[lang.selectedIndex].value
editor.session.setMode("ace/mode/" + convert[type])

// Setup file picker
let picker = document.getElementById("picker")
picker.oninput = function () {
    let content = picker.files[0].text()
    content.then((data) => {
        editor.setValue(data, -1)
        for (let con of dataCons) {
            if (con.id == peer.id) continue
            con.send({
                file: editor.getValue()
            })
        }
    })
}

const compatibleEvents = ["backspace", "del", "undo", "redo"]

editor.on("keyboardActivity", (ev) => {
    // Validate event
    if (ev.command != "insertstring" && !compatibleEvents.includes(ev.command.name)) return

    for (let con of dataCons) {
        if (con.id == peer.id) continue
        con.send({
            file: editor.getValue()
        })
    }
})

// Download code
function exportCode() {
    // Find proper extension for file
    let mode = editor.session.getMode().$id.replace("ace/mode/", "")
    download(editor.getValue(), `code.${extension[mode]}`);
}

// Copy share URL
function shareURL() {
    let i = new ClipboardItem({
        "text/plain": invite
    })
    navigator.clipboard.write([i])
}

lang.onchange = function () {
    let type = lang.options[lang.selectedIndex].value
    editor.session.setMode("ace/mode/" + convert[type])
}