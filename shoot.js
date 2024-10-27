var bullets = []
var enemybullets = []
var lastshotred = 0
var lastshotblue = 0
var fbs = false

function canshoot(lastshot, additional = 0) {
    const now = performance.now()
    return now - lastshot >= 400 + additional
}

function shoot(fromenemy = false, enemypos = null, blueshoot = false) {
    if (!done) {
        if (!blueshoot) {
            if (!canshoot(lastshotred) && !fromenemy) {return}
        }
        else {
            if (!canshoot(lastshotblue, 9600)) {return}
        }

        var size = 0.3

        if (fromenemy) {size = 0.1}

        const playerpos = controls.getObject().position
        const blockgeo = new THREE.BoxGeometry(size, size, size)
        var blockmat
        if (!blueshoot) {blockmat = new THREE.MeshBasicMaterial({color: 0xff0000})}
        else {blockmat = new THREE.MeshBasicMaterial({color: 0x5DE2E7})}
        const block = new THREE.Mesh(blockgeo, blockmat)

        var camdir = new THREE.Vector3()
        camera.getWorldDirection(camdir)

        var startpos = new THREE.Vector3()
        camera.getWorldPosition(startpos)

        if (fromenemy) {
            const playerdir = new THREE.Vector3().subVectors(playerpos, enemypos).normalize()
            
            camdir.copy(playerdir)
            startpos.copy(enemypos)
            
            enemybullets.push(block)
        }
        
        else {
            camera.getWorldDirection(camdir)
            camera.getWorldPosition(startpos)
            
            bullets.push(block)
            if (blueshoot) {lastshotblue = performance.now()}
            else {lastshotred = performance.now()}
        }

        block.position.copy(startpos)
        block.geometry.computeBoundingBox()

        const velocity = camdir.clone().multiplyScalar(fromenemy ? 0.2 : 0.5)

        if (blueshoot) {block.userData.type = "blue"}
        else {block.userData.type = "red"}

        scene.add(block)

        const updatebullet = () => {
            block.position.add(velocity)

            if (startpos.distanceTo(block.position) > 15) {
                scene.remove(block)
                bullets.splice(bullets.indexOf(block), 1)
            }
                
            else {
                renderer.render(scene, camera)
                requestAnimationFrame(updatebullet)
            }
        }

        updatebullet()
    }
}