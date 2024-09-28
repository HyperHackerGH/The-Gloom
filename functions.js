function updatehealth() {
    try {
        for (let i = 1; i <= health; i++) {document.getElementById(`h${i}`).style.animation = ""}
        for (let i = health + 1; i <= 3; i++) {document.getElementById(`h${4 - i}`).style.animation = "getsmall 0.3s ease forwards"}
    }
    catch (e) {console.log(e)}
}

function end(outcome) {
    controls.unlock()
    done = true

    var donetime = performance.now() - begintime
    var minutes = Math.floor(donetime / 60000)
    var seconds = ((donetime % 60000) / 1000).toFixed(0)

    document.getElementById("endtime").innerHTML = `Time: ${minutes}m ${seconds}s`

    document.getElementById("endtexth").innerHTML = (outcome == "win" ? "You have escaped The Gloom." : "You have failed to escape The Gloom.") + " <span id = 'xt'></span>"
    document.getElementById("end").style.display = "block"

    var xt = document.getElementById("xt")
    var xtt = outcome == "win" ? "For now..." : "Another soul lost in the dark..."
    var xtspeed = 75

    setTimeout(() => {
        document.getElementById("renderer").remove()
        xt.style.display = "inline"

        for (let i = 0; i < xtt.length; i++) {
            if (i < xtt.length) {
                setTimeout(function() {xt.innerHTML = xt.innerHTML + xtt.charAt(i)}, xtspeed * i)
            }
        }
    }, 2000)
}

function indicateenemy(infos) {
    const canvas = document.getElementById("enemyindicator")
    const ctx = canvas.getContext("2d")
    const radius = canvas.width / 2 - 20
    const centerx = canvas.width / 2
    const centery = canvas.height / 2
    const arclength = 0.2
    const trianglesize = 15

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    infos.forEach(info => {
        const angle = (90 - info.degree) * (Math.PI / 180)
        const x = centerx + radius * Math.cos(angle)
        const y = centery + radius * Math.sin(angle)

        const r = (info.color >> 16) & 0xFF
        const g = (info.color >> 8) & 0xFF
        const b = info.color & 0xFF

        ctx.beginPath()
        ctx.arc(centerx, centery, radius - 10, angle - arclength, angle + arclength)

        ctx.strokeStyle = info.aggro ? `rgba(${r}, ${g}, ${b}, 0.5)` : "transparent"
        ctx.lineWidth = 8
        ctx.stroke()
    })
}

function spawnhorde(i) {
    const x = gp(i[1])
    const z = gp(i[0])
    const dfb = 0.8

    hordes.push([
        addenemy(x, z, "brute"),

        addenemy(x - dfb, z - dfb),
        addenemy(x + dfb, z + dfb),
        addenemy(x - dfb, z + dfb),
        addenemy(x + dfb, z - dfb)
    ])
}