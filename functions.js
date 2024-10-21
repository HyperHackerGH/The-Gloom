function updatehealth() {
    try {
        for (let i = 1; i <= health; i++) {document.getElementById(`h${i}`).style.animation = ""}
        for (let i = health + 1; i <= 3; i++) {document.getElementById(`h${4 - i}`).style.animation = "getsmall 0.3s ease forwards"}
    }
    catch (e) {}
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

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    infos.forEach(info => {
        const angle = (90 - info.degree) * (Math.PI / 180)

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

function addkey(x, z) {
    const key = new THREE.Group()

    key.add(new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.015, 0.001),
        new THREE.MeshLambertMaterial({color: 0x00ff00})
    ))

    const bow = new THREE.Mesh(
        new THREE.RingGeometry(0.01, 0.02, 32),
        new THREE.MeshLambertMaterial({color: 0x00ff00, side: THREE.DoubleSide})
    )

    bow.position.x = 0.065

    key.add(bow)

    const biting1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.01, 0.02, 0.001),
        new THREE.MeshLambertMaterial({color: 0x00ff00})
    )

    const biting2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.01, 0.02, 0.001),
        new THREE.MeshLambertMaterial({color: 0x00ff00})
    )

    biting1.position.y = -0.015
    biting1.position.x = -0.045

    biting2.position.y = -0.015
    biting2.position.x = -0.025

    key.add(biting1)
    key.add(biting2)

    key.position.y = -0.4
    key.position.x = x
    key.position.z = z

    scene.add(key)

    return key
}

function collectkey() {
    scene.remove(key)
    collectedkey = true
    document.getElementById("key").style.display = "block"
}

function shufflearrays(arr) {
    let flatarr = arr.flat()

    for (let i = flatarr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [flatarr[i], flatarr[j]] = [flatarr[j], flatarr[i]]
    }

    let result = []
    let subarr = arr[0].length

    for (let i = 0; i < flatarr.length; i += subarr) {result.push(flatarr.slice(i, i + subarr))}

    return result
}

function playsound(name, stopafter, aggro = false, volume = 0.5, loop = false) {
    if (aggro) {
        if (performance.now() - lasound < 8000) {return}
        else {lasound = performance.now()}
    }

    const listener = new THREE.AudioListener()
    camera.add(listener)

    const sound = new THREE.Audio(listener)

    const audio = new THREE.AudioLoader()

    audio.load(`sounds/${name}.mp3`, (buffer) => {
        sound.setBuffer(buffer)
        sound.setLoop(loop)
        sound.setVolume(volume)
        sound.play()

        setTimeout(() => {sound.stop()}, stopafter)
    })
}

var explodes = [],
    explodevels = []

function addexplode(x, z) {
    for (let i = 0; i < 20; i++) {
        const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1)
        const material = new THREE.MeshBasicMaterial({color: Math.random() * 0xffffff})
        const cube = new THREE.Mesh(geometry, material)
        
        cube.position.set(x, 0, z)
        
        explodes.push(cube)
        scene.add(cube)
        
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5),
            0,
            (Math.random() - 0.5)
        )
    
        explodevels.push(velocity)
    }
}