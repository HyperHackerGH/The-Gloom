var bullets = []
var enemybullets = []
var lastshot = 0

function canshoot() {
    const now = performance.now()
    return now - lastshot >= 400
}

function shoot(fromenemy = false, enemypos = null) {
    if (!done) {
        if (!canshoot() && !fromenemy) {return}

        var size = 0.3

        if (fromenemy) {size = 0.1}

        const playerpos = controls.getObject().position
        const blockgeo = new THREE.BoxGeometry(size, size, size)
        const blockmat = new THREE.MeshBasicMaterial({color: 0xff0000})
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
            lastshot = performance.now()
        }

        block.position.copy(startpos)
        block.geometry.computeBoundingBox()

        const velocity = camdir.clone().multiplyScalar(fromenemy ? 0.2 : 0.5)

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