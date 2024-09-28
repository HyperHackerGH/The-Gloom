var cp = Promise.resolve()

function dialogue(text, speed = 20, clearafter = 5) {
    const element = document.getElementById("dialogue")
    const elementcontainer = document.getElementById("dialoguecontainer")

    cp = cp.then(() => new Promise(resolve => {
        var i = 0

        if (elementcontainer.style.display == "none") {elementcontainer.style.display = "block"}

        function typewriter() {
            if (i < text.length) {
                if (text.charAt(i) === "(") {
                    var pausestring = ""
                    i++
                    while (text.charAt(i) !== ")") {
                        pausestring += text.charAt(i)
                        i++
                    }
                    i++
                    setTimeout(typewriter, parseInt(pausestring) * 1000 || speed)
                }

                else {
                    element.innerHTML += text.charAt(i)
                    i++
                    setTimeout(typewriter, speed)
                }
            }

            else {
                setTimeout(() => {
                    element.innerHTML = ""
                    elementcontainer.style.display = "none"
                    resolve()
                }, clearafter * 1000)
            }
        }

        typewriter()
    }))
}

function cleardialogue() {document.getElementById("dialogue").innerHTML = ""}