const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
)

const renderer = new THREE.WebGLRenderer({antialias: true})

renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0x000000, 1)

const rendererdom = renderer.domElement

rendererdom.id = "renderer"

document.body.appendChild(rendererdom)

const mazesize = 30

const {
    maze,
    endspot,
    nextempty,
    hordespawns,
    nextemptyend,
    shooterspawns,
    infectorspawns,
    normalenemyspawns
} = makemaze(mazesize, mazesize)

var minimapdisabled = true

var
    mazepieces = [],
    wallcolliding = false,
    health = 3,

    fee = false,
    hordes = [],

    started = false,
    done = false,

    speeded = false,
    infected = false,

    moveforward = false,
    movebackward = false,
    moveleft = false,
    moveright = false,

    lasttime = performance.now(),
    begintime = 0,
    currenttime = performance.now(),

    velocity = new THREE.Vector3(),
    direction = new THREE.Vector3(),
    speed = 100 

const clock = new THREE.Clock()

const light = new THREE.PointLight(0xffffff, 3, 10)

camera.position.set(gp(1), 0, gp(1))
camera.add(light)

scene.add(camera)

var controls = new THREE.PointerLockControls(camera)

scene.add(controls.getObject())

var keydown = function(e) {
    if (started) {
        switch (e.keyCode) {
            case 38: case 87: moveforward = true; break
            case 37: case 65: moveleft = true; break
            case 40: case 83: movebackward = true; break
            case 39: case 68: moveright = true; break
        }
    }
}

var keyup = function(e) {
    if (started) {
        switch (e.keyCode) {
            case 38: case 87: moveforward = false; break
            case 37: case 65: moveleft = false; break
            case 40: case 83: movebackward = false; break
            case 39: case 68: moveright = false; break
        }
    }
}

document.addEventListener("keydown", keydown, false)
document.addEventListener("keyup", keyup, false)

document.body.addEventListener("click", function() {
    if (!done) {controls.lock()}
    if (!started) {
        begintime = performance.now()
        started = true
        cleardialogue()
        dialogue("Welcome to The Gloom.", clearafter = 2)
        // dialogue("Welcome. (2)How did you manage to get yourself in a situation like this? (3)One thing is for sure: (1)You are very unfortunate.")
        // dialogue("Obviously, you are not alone. (2)I am here to be your guide and help you escape this dark maze. (3)Get ready to face The Gloom.")
    }
    if (started && controls.isLocked) shoot()
}, false)

const floor = new THREE.Mesh(
    new THREE.BoxGeometry(mazesize * 4, 1, mazesize * 4),
    new THREE.MeshStandardMaterial({color: 0xf0f0f0})
)

floor.position.y = -2

scene.add(floor)

const b = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2, 4),
    new THREE.MeshLambertMaterial({color: 0x00ff00})
)

b.position.x = gp(endspot[1])
b.position.z = gp(endspot[0])

mazepieces.push(b)
scene.add(b)

spawnhorde(nextemptyend)

hordespawns.forEach(i => spawnhorde(i))
normalenemyspawns.forEach(i => addenemy(gp(i[1]), gp(i[0])))
infectorspawns.forEach(i => addenemy(gp(i[1]), gp(i[0]), "infector"))
shooterspawns.forEach(i => addenemy(gp(i[1]), gp(i[0]), type = "shooter"))

// addenemy(-13, -8, "shooter")
// addenemy(-13, -9)
// addenemy(-13, -10, "brute")
// addenemy(-13, -11, "infector")

function update() {
    if (controls.isLocked) {
        var enemydirs = []
        var time = performance.now()
        var delta = (time - lasttime) / 1000

        velocity.x -= velocity.x * 10 * delta
        velocity.z -= velocity.z * 10 * delta
        velocity.y -= 1000 * delta

        direction.z = Number(moveforward) - Number(movebackward)
        direction.x = Number(moveleft) - Number(moveright)
        direction.normalize()

        if (moveforward || movebackward) velocity.z -= direction.z * speed * delta
        if (moveleft || moveright) velocity.x -= direction.x * speed * delta

        const lastpos = controls.getObject().position.clone()

        if (!wallcolliding) {
            controls.getObject().translateX(velocity.x * delta)
            controls.getObject().translateZ(velocity.z * delta)
        }
        
        hordes.forEach((horde, index) => {
            if (horde.every(enemy => !enemies.includes(enemy))) {
                if (health < 3) {
                    health++
                    updatehealth()
                }
                
                hordes.splice(index, 1)
            }
        })

        var collidecount = 0

        mazepieces.forEach(piece => {
            if (colliding(controls.getObject().position.x, controls.getObject().position.z, piece.position.x, piece.position.z, 2.2)) {
                collidecount++

                const playerpos = controls.getObject().position
                var camdir = camera.getWorldDirection(new THREE.Vector3(0, 0, -1))
                var camangle = Math.atan2(camdir.x, camdir.z) * (180 / Math.PI) + 180

                const angle = ((Math.atan2(playerpos.z - piece.position.z, playerpos.x - piece.position.x) * (180 / Math.PI)) + 360) % 360

                var newx = playerpos.x, newz = playerpos.z
                const distin = 0.1

                if (angle >= 45 && angle < 135) {newz = newz - distin}  
                else if (angle >= 135 && angle < 225) {newx = newx + distin}    
                else if (angle >= 225 && angle < 315) {newz = newz + distin}
                else {newx = newx - distin}
                
                var reldir = (180 - getreldir(
                    playerpos.x, playerpos.z,
                    newx, newz,
                    camangle
                )) % 360

                reldir = reldir < 0 ? 360 + reldir : reldir

                const newvel = colvel([velocity.x, velocity.z], reldir)

                velocity.x = newvel[0] * -1
                velocity.z = newvel[1] * -1

                controls.getObject().translateX(velocity.x * delta)
                controls.getObject().translateZ(velocity.z * delta)
            }
        })

        if (collidecount > 0) {wallcolliding = true}
        else {wallcolliding = false}

        var infectedelem = document.getElementById("infected")

        if (infected) {infectedelem.style.display = "block"}
        else {infectedelem.style.display = "none"}

        var speededelem = document.getElementById("speeded")

        if (speeded) {speededelem.style.display = "block"}
        else {speededelem.style.display = "none"}

        enemybullets.forEach((bullet, bulletindex) => {
            bullets.forEach((b, i) => {
                if (colliding(bullet.position.x, bullet.position.z, b.position.x, b.position.z, 0.5)) {
                    scene.remove(bullet)
                    enemybullets.splice(bulletindex, 1)
                    
                    scene.remove(b)
                    bullets.splice(i, 1)
                }
            })

            if (colliding(bullet.position.x, bullet.position.z, controls.getObject().position.x, controls.getObject().position.z, 0.3)) {
                scene.remove(bullet)
                enemybullets.splice(bulletindex, 1)
                
                health--
                updatehealth()
                if (health <= 0) {end("lose")}
            }
        })

        enemies.forEach((enemy, index) => {
            const head = enemy.children.find(child => child.geometry.parameters.width == 0.2)
            const torso = enemy.children.find(child => child.geometry.parameters.width == 0.4)
            const larm = enemy.children.find(child => child.geometry.parameters.width == 0.15 && child.position.x == -0.35)
            const rarm = enemy.children.find(child => child.geometry.parameters.width == 0.15 && child.position.x == 0.35)
            
            bullets.forEach((bullet, bulletindex) => {
                mazepieces.forEach((piece, pieceindex) => {
                    if (colliding(bullet.position.x, bullet.position.z, piece.position.x, piece.position.z, 2)) {
                        scene.remove(bullet)
                        bullets.splice(bulletindex, 1)
                    }
                })
                
                if (colliding(enemy.position.x, enemy.position.z, bullet.position.x, bullet.position.z, enemy.userData.hitbox, enemy.position.y, bullet.position.y)) {
                    var headshot = false
                    
                    if (colliding(enemy.position.x, enemy.position.z, bullet.position.x, bullet.position.z, 0.3, head.position.y + enemy.position.y, bullet.position.y)) {headshot = true}
                    
                    enemy.userData.health -= 0.5
                    
                    if (enemy.userData.health <= 0) {
                        scene.remove(enemy)
                        enemies.splice(index, 1)

                        if (headshot) {
                            speed = 150
                            if (infected) {infected = false}
                            else {speeded = true}

                            setTimeout(() => {
                                speed = 100
                                speeded = false
                            }, 5000)
                        }
                    }
                    
                    scene.remove(bullet)
                    bullets.splice(bulletindex, 1)

                    const hitaims = document.querySelectorAll(".hitaims")
                    
                    hitaims.forEach(aim => {
                        aim.style.display = "inline"
                        if (headshot) {aim.style.backgroundColor = "#a347ff"}
                    })
                    
                    setTimeout(() => {hitaims.forEach(aim => {
                        aim.style.display = "none"
                        if (headshot) {aim.style.backgroundColor = "#008ca8"}
                    })}, 100)
                }
            })
            
            const time = clock.getElapsedTime()

            enemy.position.y = Math.sin(time * 2) * 0.1

            larm.rotation.z = -0.1 + Math.sin(time * 2) * 0.1
            rarm.rotation.z = 0.1 + Math.sin(time * 2) * -0.1

            const lightdist = enemy.position.distanceTo(camera.position)

            if (lightdist - 1 <= light.distance) {
                enemy.userData.seenlight = true
                enemy.userData.seeslight = true
                enemy.userData.aggro = true
            }
                
            else {
                enemy.userData.aggro = false
                enemy.userData.seeslight = false
            }
            
            if (colliding(controls.getObject().position.x, controls.getObject().position.z, enemy.position.x, enemy.position.z, 0.3)) {
                if (enemy.userData.type != "infector") {
                    controls.getObject().position.copy(lastpos)

                    velocity.x = 0
                    velocity.z = 0

                    if (enemy.userData.type == "brute") {health = 0}

                    health--
                    updatehealth()

                    if (health <= 0) {end("lose")}
                    else {
                        scene.remove(enemy)
                        enemies.splice(index, 1)
                    }
                }
                
                else if (enemy.userData.type == "infector") {
                    controls.getObject().position.copy(lastpos)
                    
                    scene.remove(enemy)
                    enemies.splice(index, 1)
                    speed = 50

                    if (speeded) {speeded = false}
                    else {infected = true}

                    setTimeout(() => {
                        speed = 100
                        infected = false
                    }, 5000)
                }
            }

            if (enemy.userData.aggro == true) {
                if (fee == false) {
                    fee = true
                    cleardialogue()
                    dialogue("Look out. (1)You’re not alone.")
                }
                
                if (enemy.userData.type == "shooter") {
                    if (time - enemy.userData.lastshot > enemy.userData.shottimeout) {
                        enemy.userData.lastshot = time

                        shoot(fromenemy = true, enemy.position)
                    }
                }

                const playerdir = new THREE.Vector3(
                    controls.getObject().position.x - enemy.position.x,
                    0,
                    controls.getObject().position.z - enemy.position.z
                ).normalize()

                var camdir = camera.getWorldDirection(new THREE.Vector3(0, 0, -1))
                var camangle = Math.atan2(camdir.x, camdir.z) * (180 / Math.PI) + 180

                enemy.position.add(playerdir.multiplyScalar(enemy.userData.speed))
                enemy.rotation.y = Math.atan2(playerdir.x, playerdir.z)

                const direction = getreldir(
                    controls.getObject().position.x,
                    controls.getObject().position.z,
                    enemy.position.x,
                    enemy.position.z,
                    camangle
                )
                
                enemydirs.push({
                    degree: direction,
                    aggro: enemy.userData.aggro,
                    color: enemy.userData.color
                })
            }
        })

        if (enemydirs.length > 0) indicateenemy(enemydirs)

        if (colliding(controls.getObject().position.x, controls.getObject().position.z, b.position.x, b.position.z, 2.5)) {
            controls.getObject().position.copy(lastpos)

            velocity.x = 0
            velocity.z = 0
            end("win")
        }

        if (Math.abs(controls.getObject().position.y) > 0) {
            velocity.y = 0
            controls.getObject().position.y = 0
        }

        lasttime = time
    }
}

maze.forEach((v, i) => {
    v.forEach((j, k) => {
        if (j == "#") {
            const b = new THREE.Mesh(
                new THREE.BoxGeometry(4, 2, 4),
                new THREE.MeshLambertMaterial({color: 0xffffff})
            )

            b.position.x = gp(k)
            b.position.z = gp(i)

            scene.add(b)
            mazepieces.push(b)
        }
    })
})

if (nextempty == "down") {camera.lookAt(gp(1), 0, gp(1) + 1)}
if (nextempty == "right") {camera.lookAt(gp(1) + 1, 0, gp(1))}

window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
})

const timer = document.getElementById("time")
var displayed = false

const minimap = document.getElementById("minimap").getContext("2d")

function mps(p) {return 200 * ((p + 60) / (mazesize * 2))}

function gameloop() {
    if (started && !done) {
        if (!displayed) {
            timer.style.display = "block"
            document.getElementById("health").style.display = "block"
            displayed = true
        }

        var donetime = performance.now() - begintime
        var minutes = Math.floor(donetime / 60000)
        var seconds = ((donetime % 60000) / 1000).toFixed(0)

        timer.innerHTML = `${minutes}m ${seconds}s`
    }

    if (!minimapdisabled && document.getElementById("minimap").style.display != "block") {document.getElementById("minimap").style.display = "block"}
    
    if (!minimapdisabled) {
        minimap.clearRect(0, 0, 400, 400)
    
        for (let i of mazepieces) {
            var mpx = mps(i.position.z) - 7
            var mpz = mps(i.position.x) - 7
            
            minimap.fillStyle = "#fff"
            
            minimap.fillRect(mpx, mpz, 14, 14)
        }

        minimap.fillStyle = "#0f0"
        minimap.fillRect(mps(b.position.z) - 7, mps(b.position.x) - 7, 14, 14)
        
        minimap.fillStyle = "#f00"
        minimap.fillRect(mps(controls.getObject().position.z) - 3, mps(controls.getObject().position.x) - 3, 6, 6)
    }

    var aggrocount = 0

    enemies.forEach(enemy => {
        if (enemy.userData.aggro) {aggrocount += 1}

        if (!minimapdisabled) {
            if (enemy.userData.type == "infector") {minimap.fillStyle = "#0f0"}
            else {minimap.fillStyle = "#f00"}
            
            minimap.fillRect(mps(enemy.position.z) - 1, mps(enemy.position.x) - 1, 3, 3)
        }
    })

    if (aggrocount == 0) {
        const canvas = document.getElementById("enemyindicator")
        const ctx = canvas.getContext("2d")

        ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    update()
    renderer.render(scene, camera)
    
    requestAnimationFrame(gameloop)
}

gameloop()