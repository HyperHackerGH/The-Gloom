function gp(p) {return (p / (mazesize - 1)) * (mazesize * 4 - 6) - (mazesize * 2 - 3)}

function getreldir(ax, ay, bx, by, camangle) {
    var deltax = bx - ax
    var deltay = by - ay
    var bearingabs = Math.atan2(deltax, deltay) * (180 / Math.PI)

    var relativedir = bearingabs - camangle

    var final = (relativedir + 360) % 360

    return final
}

function colvel(velocity, wallang, scalefactor = 0.1) {
    const thetarad = wallang * Math.PI / 180

    const normx = Math.cos(thetarad)
    const normy = Math.sin(thetarad)

    const vx = velocity[0]
    const vy = velocity[1]

    const dotprod = vx * normx + vy * normy

    const velocitynormx = dotprod * normx
    const velocitynormy = dotprod * normy

    const scaledvelnormx = scalefactor * velocitynormx
    const scaledvelnormy = scalefactor * velocitynormy

    const newvelx = vx - (velocitynormx - scaledvelnormx)
    const newvely = vy - (velocitynormy - scaledvelnormy)

    return [newvelx, newvely]
}

function colliding(x, z, x1, z1, d, y = 0, y1 = 0) {
    if (Math.abs(x - x1) < d && Math.abs(z - z1) < d && Math.abs(y - y1) < d) return true
    return false
}