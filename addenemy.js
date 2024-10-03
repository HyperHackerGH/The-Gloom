var enemies = []

function addenemy(x, z, type = "normal", inhorde = false) {
    const enemy = new THREE.Group()

    if (type == "shooter") {
        enemy.userData.shottimeout = 2
        enemy.userData.lastshot = 0
    }

    enemy.userData.inhorde = inhorde
    enemy.userData.seenlight = false
    enemy.userData.seeslight = false
    enemy.userData.aggro = false
    enemy.userData.type = type
    enemy.userData.speed =
        type == "brute" ? 0.05 :
        type == "infector" ? 0.07 :
        0.06
    enemy.userData.health = 
        type == "shooter" ? 1 :
        type == "boss" ? 1.5 :
        0.5
    enemy.userData.color =
        type == "infector" ? 0x00ff00 :
        type == "shooter" ? 0x3963EE :
        type == "boss" ? 0x8c6dff :
        0xff0000
    enemy.userData.scale =
        type == "normal" ? 0.5 :
        type == "shooter" ? 0.5 :
        type == "infector" ? 0.4 :
        type == "boss" ? 1.6 :
        1

    const torso = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.6, 0.2),
        new THREE.MeshLambertMaterial({color: enemy.userData.color})
    )

    torso.rotation.x = 0.3
    torso.position.z = -0.2

    const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.2, 0.2),
        new THREE.MeshLambertMaterial({color: enemy.userData.color})
    )

    head.position.y = 0.475

    const larm = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.4, 0.15),
        new THREE.MeshLambertMaterial({color: enemy.userData.color})
    )
    
    larm.position.x = -0.35

    if (type != "shooter") {
        larm.position.y = 0.1
        larm.rotation.x = 0.1
    }
        
    else {
        larm.position.y = 0.15
        larm.rotation.x = -1.25
    }

    const rarm = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.4, 0.15),
        new THREE.MeshLambertMaterial({color: enemy.userData.color})
    )
    
    rarm.position.x = 0.35

    if (type != "shooter") {
        rarm.position.y = 0.1
        rarm.rotation.x = 0.1
    }

    else {
        rarm.position.y = 0.15
        rarm.rotation.x = -1.25
    }

    enemy.add(torso)
    enemy.add(head)
    enemy.add(larm)
    enemy.add(rarm)

    enemy.position.x = x
    enemy.position.z = z

    enemies.push(enemy)
    scene.add(enemy)

    if (type == "normal" || type == "shooter") {enemy.userData.hitbox = 0.4}

    if (type == "infector") {enemy.userData.hitbox = 0.25}
    
    if (type == "brute") {
        enemy.userData.hitbox = 0.96
        enemy.userData.health = 1.5
    }

    if (type == "boss") {enemy.userData.hitbox = 0.8}

    enemy.scale.set(
        enemy.userData.scale,
        enemy.userData.scale,
        enemy.userData.scale
    )

    return enemy
}