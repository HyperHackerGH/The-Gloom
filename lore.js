const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
)

const renderer = new THREE.WebGLRenderer({antialias: true})

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0x000000, 1)

const rendererdom = renderer.domElement

document.body.appendChild(rendererdom)

document.getElementById("dialoguecontainer").style.display = "block"

camera.position.z = 10

var shaking = false
var explode = false

const cubes = []
const velocities = []

for (let i = 0; i < 200; i++) {
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
    const material = new THREE.MeshBasicMaterial({color: Math.random() * 0xffffff})
    const cube = new THREE.Mesh(geometry, material)
    
    cube.position.set(0, 0, 0)
    
    cubes.push(cube)
    
    const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3
    )

    velocities.push(velocity)
}

const box = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshBasicMaterial({color: 0x00dd00})
)

box.position.set(0, 0, 0)
box.rotation.x = 0.3

scene.add(box)

var enemies = []

function enemy() {
    const boss = new THREE.Group()
    
    boss.userData.color = 0x8c6dff
    
    const torso = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.6, 0.2),
        new THREE.MeshBasicMaterial({color: boss.userData.color})
    )
    
    torso.rotation.x = 0.3
    torso.position.z = -0.2
    
    const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.2, 0.2),
        new THREE.MeshBasicMaterial({color: boss.userData.color})
    )
    
    head.position.y = 0.475
    
    const larm = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.4, 0.15),
        new THREE.MeshBasicMaterial({color: boss.userData.color})
    )
    
    larm.position.x = -0.35
    
    larm.position.y = 0.1
    larm.rotation.x = 0.1
    
    const rarm = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.4, 0.15),
        new THREE.MeshBasicMaterial({color: boss.userData.color})
    )
    
    rarm.position.x = 0.35
    
    rarm.position.y = 0.1
    rarm.rotation.x = 0.1
    
    boss.add(torso)
    boss.add(head)
    boss.add(larm)
    boss.add(rarm)
    
    boss.position.set(0, 0, 0)
    
    enemies.push(boss)
    scene.add(boss)

    return boss
}

function spawnboss() {
    for (let i of cubes) {scene.remove(i)}

    const boss = enemy()
    const minion = enemy()

    minion.position.set(-30, 0, 0)
    
    for (let i = 0; i < 100; i++) {
        const s = (i / 100) * 5
        setTimeout(() => {boss.scale.set(s, s, s)}, i * 10)
    }

    setTimeout(() => {
        dialogue("Finally,(3) after ages of suffering,(2) I can see the light,(3) it disgusts me.(3) This universe shall never see light again.", 30, 3)
        setTimeout(() => {
            dialogue("Minion!(7) I summon you for the purpose of removing all light from this universe.(3) The power of the darkness will prevail,(2) go now!")
            setTimeout(() => {
                var done = false
                const targetpos = minion.position.clone()
                const lerpspeed = 0.05
                const steps = 100000

                function camlookat(step) {
                    if (step >= steps) return

                    const direction = targetpos.clone().sub(camera.position).normalize()
                    const clookat = camera.getWorldDirection(new THREE.Vector3())
                    const nlookat = clookat.lerp(direction, lerpspeed).normalize()
                    const newtarget = camera.position.clone().add(nlookat)

                    if (!done) {camera.lookAt(newtarget)}
                    renderer.render(scene, camera)

                    requestAnimationFrame(() => camlookat(step + 1))
                }

                camlookat(0)

                const moveminion = () => {
                    const movesteps = 100
                    const distance = 25
                    const increment = distance / movesteps
                    var currstep = 0

                    const move = () => {
                        if (currstep < movesteps && !done) {
                            minion.position.x += increment
                            camera.lookAt(minion.position)
                            renderer.render(scene, camera)
                            currstep++
                            requestAnimationFrame(move)
                        }

                        else {done = true}
                    }

                    move()
                }

                setTimeout(() => {requestAnimationFrame(moveminion)}, 4000)
                setTimeout(() => {window.location.href = "/"}, 17000)
            }, 14000)
        }, 4000)
    }, 1000)
}

setTimeout(() => {
    dialogue("The power,(2) the power of the darkness,(2) I can feel it.")
    setTimeout(() => {shaking = true}, 2000)
}, 2000)

setTimeout(() => {
    for (let i = 0; i < 100; i++) {
        const s = 1 - (i / 100)
        setTimeout(() => {box.scale.set(s, s, s)}, i * 10)
    }
}, 10000)

setTimeout(() => {
    for (let i of cubes) {scene.add(i)}
    scene.remove(box)
    explode = true
    setTimeout(spawnboss, 3000)
}, 11000)

window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
})

function gameloop() {
    const time = performance.now()

    if (explode) {
        for (let i = 0; i < cubes.length; i++) {cubes[i].position.add(velocities[i]);}
    }
    
    box.position.y = Math.cos(time * 0.001) * 0.1

    if (shaking) {
        box.position.x = Math.sin(time * 0.02) * 0.1
        box.rotation.y = Math.sin(time * 0.003) * 0.1
    }

    enemies.forEach((e) => {
        const playerdir = new THREE.Vector3(
            camera.position.x - e.position.x,
            0,
            camera.position.z - e.position.z
        ).normalize()

        e.rotation.y = Math.atan2(playerdir.x, playerdir.z)
    })
    
    renderer.render(scene, camera)
    requestAnimationFrame(gameloop)
}

gameloop()